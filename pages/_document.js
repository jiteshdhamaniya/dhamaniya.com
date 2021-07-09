import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
            <script 
            async 
            defer 
            crossorigin="anonymous" 
            src="https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v11.0" 
            nonce="MoFVWeZV">
            </script>         
        </Head>
        
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument