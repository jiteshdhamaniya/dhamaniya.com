import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Header from "../../Components/Header";

// Simple markdown to HTML (reuse from posts)
function markdownToHtml(markdown) {
  let html = markdown

  // Convert headers
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-2">$1</h2>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')

  // Convert bold (must be before bullet list processing)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')

  // Convert bullet lists - find consecutive lines starting with * or -
  html = html.replace(/^(\* .+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line => {
      const content = line.replace(/^\* /, '').trim()
      return `<li class="ml-6">${content}</li>`
    }).join('\n')
    return `<ul class="list-disc mb-4">\n${items}\n</ul>`
  })

  // Convert italic (after lists, to avoid conflict with *)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Split into paragraphs
  const paragraphs = html.split(/\n\n+/)
  html = paragraphs
    .map(p => {
      p = p.trim()
      if (!p) return ''
      // Don't wrap if already an HTML element
      if (p.startsWith('<h2') || p.startsWith('<h3') || p.startsWith('<ul') || p.startsWith('<ol')) return p
      return `<p class="mb-4">${p}</p>`
    })
    .filter(p => p)
    .join('\n')

  return html
}

export default function PrivacyPolicy({ page }) {
  return (
    <div>
      <Header>
        <title>{page.title} | Jitesh Dhamaniya</title>
        <meta name="title" content={page.title} />
        <meta name="description" content="Privacy Policy for Expense Tracker app" />
        <meta name="author" content="Jitesh Dhamaniya" />
      </Header>

      <div className="py-5 rounded space-y-4 leading-9">
        <h1 className="text-5xl font-bold py-4">{page.title}</h1>

        <div
          className="font-serif text-xl leading-10 text-gray-700"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'content/pages/expense-tracker-privacy-policy.md')
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    props: {
      page: {
        title: data.title,
        content: markdownToHtml(content)
      }
    }
  }
}
