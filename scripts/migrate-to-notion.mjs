import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Client } from '@notionhq/client'

const NOTION_TOKEN = process.env.NOTION_TOKEN
const DATABASE_ID = process.env.NOTION_DATABASE_ID

const notion = new Client({ auth: NOTION_TOKEN })

const postsDirectory = path.join(process.cwd(), 'content/posts')

// Parse inline markdown to Notion rich_text array
function parseInlineMarkdown(text) {
  const richText = []
  // Regex to match: **bold**, *italic*, [link text](url), or plain text
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)|[^*\[]+)/g
  let match

  while ((match = pattern.exec(text)) !== null) {
    const full = match[0]

    if (match[2]) {
      // Bold: **text**
      richText.push({
        type: 'text',
        text: { content: match[2] },
        annotations: { bold: true }
      })
    } else if (match[3]) {
      // Italic: *text*
      richText.push({
        type: 'text',
        text: { content: match[3] },
        annotations: { italic: true }
      })
    } else if (match[4] && match[5]) {
      // Link: [text](url)
      richText.push({
        type: 'text',
        text: { content: match[4], link: { url: match[5] } }
      })
    } else if (full.trim() || full.includes(' ')) {
      // Plain text
      richText.push({
        type: 'text',
        text: { content: full }
      })
    }
  }

  return richText.length > 0 ? richText : [{ type: 'text', text: { content: text } }]
}

// Convert markdown content to Notion blocks
function markdownToNotionBlocks(content) {
  const blocks = []
  const lines = content.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip empty lines
    if (line.trim() === '') {
      i++
      continue
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '- - -') {
      blocks.push({ object: 'block', type: 'divider', divider: {} })
      i++
      continue
    }

    // Heading 2: **Bold text on its own line** (used as section headers in the posts)
    if (/^\*\*(.+)\*\*$/.test(line.trim())) {
      const heading = line.trim().match(/^\*\*(.+)\*\*$/)[1]
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: heading } }]
        }
      })
      i++
      continue
    }

    // Unordered list item
    if (line.trim().startsWith('- ')) {
      const itemText = line.trim().substring(2)
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: parseInlineMarkdown(itemText)
        }
      })
      i++
      continue
    }

    // Regular paragraph - collect consecutive non-empty, non-special lines
    let paragraphLines = []
    while (i < lines.length && lines[i].trim() !== '' &&
           lines[i].trim() !== '---' && lines[i].trim() !== '- - -' &&
           !lines[i].trim().startsWith('- ')) {
      paragraphLines.push(lines[i])
      i++
    }

    if (paragraphLines.length > 0) {
      const text = paragraphLines.join('\n')
      const richText = parseInlineMarkdown(text)

      // Notion has a 2000 char limit per rich_text content
      // Truncate if needed
      const totalLength = richText.reduce((sum, rt) => sum + rt.text.content.length, 0)
      if (totalLength > 1900) {
        // Split into multiple paragraph blocks
        let current = ''
        for (const rt of richText) {
          current += rt.text.content
        }
        const chunks = current.match(/.{1,1900}/gs) || [current]
        for (const chunk of chunks) {
          blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] }
          })
        }
      } else {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: richText }
        })
      }
    }
  }

  return blocks
}

async function migratePost(filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)

  const dateStr = data.date instanceof Date ? data.date.toISOString() : new Date(data.date).toISOString()
  const modifiedStr = data.modified
    ? (data.modified instanceof Date ? data.modified.toISOString() : new Date(data.modified).toISOString())
    : dateStr

  const blocks = markdownToNotionBlocks(content)

  // Notion API limits to 100 blocks per request
  const blockChunks = []
  for (let i = 0; i < blocks.length; i += 100) {
    blockChunks.push(blocks.slice(i, i + 100))
  }

  const properties = {
    Title: {
      title: [{ type: 'text', text: { content: data.title } }]
    },
    Slug: {
      rich_text: [{ type: 'text', text: { content: data.slug } }]
    },
    Date: {
      date: { start: dateStr.split('T')[0] + 'T' + dateStr.split('T')[1] }
    },
    Modified: {
      date: { start: modifiedStr.split('T')[0] + 'T' + modifiedStr.split('T')[1] }
    },
    Status: {
      select: { name: 'Published' }
    }
  }

  // Create page with first batch of blocks
  const page = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties,
    children: blockChunks[0] || []
  })

  // Append remaining blocks if more than 100
  for (let i = 1; i < blockChunks.length; i++) {
    await notion.blocks.children.append({
      block_id: page.id,
      children: blockChunks[i]
    })
  }

  console.log(`  Migrated: ${data.title} (${data.slug})`)
  return page.id
}

async function main() {
  console.log('Starting migration to Notion...')
  console.log(`Database ID: ${DATABASE_ID}`)

  const fileNames = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.md'))
  console.log(`Found ${fileNames.length} posts to migrate\n`)

  for (const fileName of fileNames) {
    const filePath = path.join(postsDirectory, fileName)
    try {
      await migratePost(filePath)
    } catch (err) {
      console.error(`  FAILED: ${fileName} - ${err.message}`)
    }
    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 400))
  }

  console.log('\nMigration complete!')
}

main().catch(console.error)
