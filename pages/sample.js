import Head from "next/head"
import marked from 'marked';
import HtmlToReactParser from 'html-to-react';

// The Storyblok Client
import Storyblok from "../lib/storyblok"
 
export default function Home(props) {

    const parser = HtmlToReactParser.Parser;

    console.log(props.stories)

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
 
      <header>
        <h1>
          { props.story ? props.story.name : 'My Site' }
        </h1>

      </header>
 
      <main>
            
        { 
            props.stories.map((item,i)=>
            <div key={i} className=" p-5 rounded space-y-2">
                        <h3 className="text-3xl">{item.name}</h3>
                        <div
                            dangerouslySetInnerHTML={{
                              __html: marked(item.content.intro)
                            }}></div>

                        {/* <p className="font-serif font-thin text-lg leading-7">
                            {parser(marked(item.content.intro))}
                        </p>                 */}
                </div>
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