
import Header from '../Components/Header'

import PostComponent from '../Components/PostComponent';
import useSWR from 'swr'
import fetch from 'unfetch'


export default function Home(props) {

  const fetcher = url => fetch(url).then(r => r.json())

  const url = process.env.NEXT_PUBLIC_BASE_URL+'posts/'

  const { data, error } = useSWR(    
    url,fetcher
  );
  
    if (error) return <div>failed to load</div>
    if (!data) return <div>Loading...</div>

  return (
    <div>
          <Header />        
          <main>{data.map((item,i)=>  <PostComponent post={item} key={i} />)}</main>
    </div>
  )
}
