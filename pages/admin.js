import Head from 'next/head'
import { useEffect } from 'react'

export default function Admin() {
  useEffect(() => {
    // Load Decap CMS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js'
    document.body.appendChild(script)
  }, [])

  return (
    <>
      <Head>
        <title>Content Manager | Jitesh Dhamaniya</title>
        <meta name="robots" content="noindex" />
      </Head>
    </>
  )
}
