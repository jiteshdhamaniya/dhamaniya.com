import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export function getAllPosts() {
  const fileNames = fs.readdirSync(postsDirectory)

  const allPosts = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const filePath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)

      // Convert dates to ISO strings for JSON serialization
      const dateStr = data.date instanceof Date ? data.date.toISOString() : data.date
      const modifiedStr = data.modified
        ? (data.modified instanceof Date ? data.modified.toISOString() : data.modified)
        : dateStr

      return {
        slug: data.slug,
        title: { rendered: data.title },
        date: dateStr,
        modified: modifiedStr,
        featured_media: data.featured_image ? 1 : 0,
        featuredImage: data.featured_image || null,
        content: { rendered: markdownToHtml(content) }
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return allPosts
}

export function getPostBySlug(slug) {
  const fileNames = fs.readdirSync(postsDirectory)

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md')) continue

    const filePath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    if (data.slug === slug) {
      // Convert dates to ISO strings for JSON serialization
      const dateStr = data.date instanceof Date ? data.date.toISOString() : data.date
      const modifiedStr = data.modified
        ? (data.modified instanceof Date ? data.modified.toISOString() : data.modified)
        : dateStr

      return {
        slug: data.slug,
        title: { rendered: data.title },
        date: dateStr,
        modified: modifiedStr,
        featured_media: data.featured_image ? 1 : 0,
        featuredImage: data.featured_image || null,
        content: { rendered: markdownToHtml(content) }
      }
    }
  }

  return null
}

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
  let html = markdown

  // Convert horizontal rules
  html = html.replace(/^---$/gm, '<hr class="wp-block-separator has-alpha-channel-opacity"/>')

  // Convert bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Convert italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Convert unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="wp-block-list">$&</ul>')

  // Convert paragraphs (lines separated by blank lines)
  const paragraphs = html.split(/\n\n+/)
  html = paragraphs
    .map(p => {
      p = p.trim()
      if (!p) return ''
      if (p.startsWith('<hr') || p.startsWith('<ul')) return p
      // Handle line breaks within paragraphs
      p = p.replace(/\n/g, '<br>')
      return `<p>${p}</p>`
    })
    .filter(p => p)
    .join('\n\n')

  return html
}
