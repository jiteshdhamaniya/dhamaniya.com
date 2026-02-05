import Head from 'next/head'
import { useEffect } from 'react'

export default function Admin() {
  useEffect(() => {
    // Redirect to the static admin UI so config.yml resolves from /admin/.
    window.location.replace('/admin/index.html')
  }, [])

  return (
    <>
      <Head>
        <title>Content Manager | Jitesh Dhamaniya</title>
        <meta name="robots" content="noindex" />
      </Head>
      <p>Loading admin...</p>
    </>
  )
}
