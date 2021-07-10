import Footer from '../Components/Footer'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
      <div className="container max-w-[1024px] m-auto my-14 antialiased px-4 md:px-0"> 
      <Component {...pageProps} />
      <Footer />
     </div>
  )
}

export default MyApp
