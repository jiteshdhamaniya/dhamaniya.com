import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const databaseId = process.env.NOTION_DATABASE_ID

// Convert Notion rich_text array to HTML string
function richTextToHtml(richTextArray) {
  if (!richTextArray) return ''
  return richTextArray.map(rt => {
    let text = rt.plain_text || ''
    // Escape HTML entities in the text
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    if (rt.annotations) {
      if (rt.annotations.bold) text = `<strong>${text}</strong>`
      if (rt.annotations.italic) text = `<em>${text}</em>`
      if (rt.annotations.strikethrough) text = `<del>${text}</del>`
      if (rt.annotations.code) text = `<code>${text}</code>`
    }
    if (rt.href) {
      text = `<a href="${rt.href}">${text}</a>`
    }
    return text
  }).join('')
}

// Convert Notion blocks to HTML
async function blocksToHtml(pageId) {
  const blocks = []
  let cursor
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100
    })
    blocks.push(...response.results)
    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)

  const htmlParts = []
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        const pText = richTextToHtml(block.paragraph.rich_text)
        if (pText) htmlParts.push(`<p>${pText}</p>`)
        break
      case 'heading_1':
        htmlParts.push(`<h1>${richTextToHtml(block.heading_1.rich_text)}</h1>`)
        break
      case 'heading_2':
        htmlParts.push(`<h2>${richTextToHtml(block.heading_2.rich_text)}</h2>`)
        break
      case 'heading_3':
        htmlParts.push(`<h3>${richTextToHtml(block.heading_3.rich_text)}</h3>`)
        break
      case 'bulleted_list_item':
        htmlParts.push(`<li>${richTextToHtml(block.bulleted_list_item.rich_text)}</li>`)
        break
      case 'numbered_list_item':
        htmlParts.push(`<li>${richTextToHtml(block.numbered_list_item.rich_text)}</li>`)
        break
      case 'quote':
        htmlParts.push(`<blockquote>${richTextToHtml(block.quote.rich_text)}</blockquote>`)
        break
      case 'code':
        htmlParts.push(`<pre><code>${richTextToHtml(block.code.rich_text)}</code></pre>`)
        break
      case 'divider':
        htmlParts.push('<hr class="wp-block-separator has-alpha-channel-opacity"/>')
        break
      case 'image': {
        const src = block.image.type === 'file'
          ? block.image.file.url
          : block.image.external?.url || ''
        const caption = block.image.caption ? richTextToHtml(block.image.caption) : ''
        htmlParts.push(`<figure><img src="${src}" alt="${caption}" />${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`)
        break
      }
      default:
        break
    }
  }

  // Wrap consecutive <li> items in <ul> tags
  let html = htmlParts.join('\n')
  html = html.replace(/(<li>.*?<\/li>\n?)+/gs, match => {
    return `<ul class="wp-block-list">${match}</ul>`
  })

  return html
}

// Get a Notion property value
function getProperty(properties, name, type) {
  const prop = properties[name]
  if (!prop) return null
  switch (type) {
    case 'title':
      return prop.title?.map(t => t.plain_text).join('') || ''
    case 'rich_text':
      return prop.rich_text?.map(t => t.plain_text).join('') || ''
    case 'date':
      return prop.date?.start || null
    case 'select':
      return prop.select?.name || null
    default:
      return null
  }
}

export async function getAllPosts() {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Published' }
    },
    sorts: [{ property: 'Date', direction: 'descending' }]
  })

  // Slugs that have dedicated pages and shouldn't appear in the blog listing
  const excludedSlugs = ['tools']

  const posts = await Promise.all(
    response.results
      .filter(page => !excludedSlugs.includes(getProperty(page.properties, 'Slug', 'rich_text')))
      .map(async page => {
        const title = getProperty(page.properties, 'Title', 'title')
        const slug = getProperty(page.properties, 'Slug', 'rich_text')
        const date = getProperty(page.properties, 'Date', 'date')
        const modified = getProperty(page.properties, 'Modified', 'date') || date
        const html = await blocksToHtml(page.id)

        return {
          slug,
          title: { rendered: title },
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          modified: modified ? new Date(modified).toISOString() : date ? new Date(date).toISOString() : new Date().toISOString(),
          featured_media: 0,
          featuredImage: null,
          content: { rendered: html }
        }
      })
  )

  return posts
}

// Extract structured tool entries from Notion blocks
export async function getToolsFromSlug(slug) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Slug',
      rich_text: { equals: slug }
    }
  })

  if (response.results.length === 0) return []

  const page = response.results[0]
  const blocks = []
  let cursor
  do {
    const res = await notion.blocks.children.list({
      block_id: page.id,
      start_cursor: cursor,
      page_size: 100
    })
    blocks.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)

  const tools = []
  for (const block of blocks) {
    if (block.type !== 'paragraph' || !block.paragraph.rich_text.length) continue

    const richText = block.paragraph.rich_text
    let name = ''
    let url = ''

    for (const rt of richText) {
      if (rt.href) {
        url = rt.href
      } else {
        name += rt.plain_text
      }
    }

    name = name.trim()
    if (name && url) {
      tools.push({ name, url })
    }
  }

  return tools
}

export async function getPostBySlug(slug) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Slug',
      rich_text: { equals: slug }
    }
  })

  if (response.results.length === 0) return null

  const page = response.results[0]
  const title = getProperty(page.properties, 'Title', 'title')
  const date = getProperty(page.properties, 'Date', 'date')
  const modified = getProperty(page.properties, 'Modified', 'date') || date
  const html = await blocksToHtml(page.id)

  return {
    slug,
    title: { rendered: title },
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    modified: modified ? new Date(modified).toISOString() : date ? new Date(date).toISOString() : new Date().toISOString(),
    featured_media: 0,
    featuredImage: null,
    content: { rendered: html }
  }
}
