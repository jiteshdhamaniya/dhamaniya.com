import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const databaseId = process.env.NOTION_DATABASE_ID

// Generate URL-friendly slug from title
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')   // remove non-word chars (keeps Hindi/Urdu via \w in some contexts, but for URL we transliterate)
    .replace(/[\s_]+/g, '-')     // spaces/underscores to hyphens
    .replace(/-+/g, '-')         // collapse multiple hyphens
    .replace(/^-|-$/g, '')       // trim leading/trailing hyphens
}

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

// Build a post object from a Notion page
async function pageToPost(page) {
  const title = getProperty(page.properties, 'Title', 'title')
  const slugProp = getProperty(page.properties, 'Slug', 'rich_text')
  const slug = slugProp || slugify(title)
  const dateProp = getProperty(page.properties, 'Date', 'date')
  const date = dateProp || page.created_time
  const modified = page.last_edited_time
  const html = await blocksToHtml(page.id)

  return {
    slug,
    title: { rendered: title },
    date: new Date(date).toISOString(),
    modified: new Date(modified).toISOString(),
    featured_media: 0,
    featuredImage: null,
    content: { rendered: html }
  }
}

export async function getAllPosts() {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        { property: 'Status', select: { equals: 'Published' } },
        { property: 'Type', select: { equals: 'Post' } }
      ]
    },
    sorts: [{ property: 'Date', direction: 'descending' }]
  })

  const posts = await Promise.all(response.results.map(pageToPost))

  // Sort by date (handles mix of Date property and created_time)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date))

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
  // First try exact slug match
  let response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Slug',
      rich_text: { equals: slug }
    }
  })

  // If no match, try matching by auto-generated slug from title
  if (response.results.length === 0) {
    const allResponse = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Status',
        select: { equals: 'Published' }
      }
    })
    const match = allResponse.results.find(page => {
      const title = getProperty(page.properties, 'Title', 'title')
      const slugProp = getProperty(page.properties, 'Slug', 'rich_text')
      return (slugProp || slugify(title)) === slug
    })
    if (!match) return null
    return pageToPost(match)
  }

  return pageToPost(response.results[0])
}
