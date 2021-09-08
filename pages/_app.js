import Footer from '../Components/Footer'
import '../styles/globals.css'
import NextNprogress from 'nextjs-progressbar';

function MyApp({ Component, pageProps }) {
  return (
    <>
    <NextNprogress
      color="#29D"
      startPosition={0.3}
      stopDelayMs={200}
      height={3}
      showOnShallow={true}
    />
      <div className="container max-w-[1024px] m-auto my-14 antialiased px-2"> 
      <Component {...pageProps} />
      <Footer />
     </div>
     </>
  )
}

export default MyApp
