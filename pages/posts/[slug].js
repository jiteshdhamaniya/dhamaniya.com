import Head from 'next/head'
import Image from 'next/image'
import marked from 'marked';

// The Storyblok Client
import Storyblok from "../lib/storyblok"
import Header from '../Components/Header'
import Link from 'next/link';

export default function Home(props) {
  return (
    <div>
          <Header />        

          <main>
            
            { 
                props.stories.map((item,i)=>
                {
                    console.log(item)                  
                 return (<div key={i} className=" p-5 rounded space-y-2 leading-9">
                            <Link href="/">
                              <h3 className="text-5xl font-bold py-4 hover:text-gray-700">
                                {item.name}
                              </h3>                              
                            </Link>
                            <div
                            className="font-serif text-xl leading-9"
                            dangerouslySetInnerHTML={{
                              __html: marked(item.content.long_text)
                            }}></div>

                            <div className="pt-5">    
                             <Link href="/"> 
                               Continue Reading                              
                             </Link> 
                             </div>

{/* <p className="font-serif font-thin text-lg leading-7">
                                {marked(item.content.intro)}
                            </p>                 */}
                    </div>
                  )
                  }
                )
            }        
                
    
          </main>

    </div>
  )
}

export async function getStaticProps(context) {
  // the slug of the story
  let slug = "home"
  // the storyblok params
  let params = {
    version: "draft", // or 'published'
  }
 
  // checks if Next.js is in preview mode
  if (context.preview) {
    // loads the draft version
    params.version = "published"
    // appends the cache version to get the latest content
    params.cv = Date.now()
  }
 
  // loads the story from the Storyblok API
  let { data } = await Storyblok.get(`cdn/stories/${slug}`, params)

  const _data  = await Storyblok.get(`cdn/stories/?filter_query[component][in]=article`);

  const stories = _data.data.stories;
 
  // return the story from Storyblok and whether preview mode is active
  return {
    props: {
      stories,
      story: data ? data.story : false,
      preview: context.preview || false
    },
    revalidate: 10, 
  }
}