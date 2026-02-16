import Header from '../Components/Header'
import { getToolsFromSlug } from '../lib/posts'

export default function Tools({ tools }) {
  return (
    <div>
      <Header>
        <title>Tools &#8211; Jitesh Dhamaniya</title>
        <meta name="title" content="Tools - Jitesh Dhamaniya" />
        <meta name="description" content="Small tools I have built." />
      </Header>

      <div className="py-8">
        <h1 className="text-5xl font-bold pb-2">Tools</h1>
        <p className="text-gray-500 text-lg pb-8">Small things I built.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool, i) => (
            <a
              key={i}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-gray-200 rounded-lg p-5 no-underline hover:border-gray-400 hover:shadow-sm transition-all"
              style={{ textDecoration: 'none', borderBottom: '1px solid #e5e7eb' }}
            >
              <h3 className="text-lg font-semibold text-black" style={{ borderBottom: 'none' }}>
                {tool.name}
              </h3>
              <span className="text-sm text-gray-400 mt-2 block" style={{ borderBottom: 'none' }}>
                {tool.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export async function getStaticProps() {
  const tools = await getToolsFromSlug('tools')

  return {
    props: { tools },
    revalidate: 60
  }
}
