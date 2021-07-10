import Head from 'next/head'
import Image from 'next/image'
import marked from 'marked';

// The Storyblok Client
import Storyblok from "../lib/storyblok"
import Header from '../Components/Header'

import date from 'date-and-time';
import PostComponent from '../Components/PostComponent';


export default function Home(props) {
  return (
    <div>
          <Header />        
          <main>            
            { props.stories.map((item,i)=> <PostComponent post={item} key={i} />)}                            
          </main>
    </div>
  )
}

export async function getStaticProps(context) {
  
  const data  = await Storyblok.get(`cdn/stories/?filter_query[component][in]=article&sort_by=first_published_at:desc`);

  let stories = data.data.stories;

  stories = stories.map((item, i)=>{
      const archive = date.format(new Date(item.first_published_at), 'YYYY/MM/DD'); 
      item.url = `${archive}/${item.slug}`;
      return item;
  })

  // return the story from Storyblok and whether preview mode is active
  return {
    props: {
      stories      
    },
    revalidate: 10, 
  }
}