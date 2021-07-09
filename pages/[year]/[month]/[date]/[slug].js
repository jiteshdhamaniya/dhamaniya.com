import Head from "next/head"
import marked from 'marked';

// The Storyblok Client
import Storyblok from '../../../../lib/storyblok';
import Header from "../../../../Components/Header";
 
export default function Post(props) {

  return (
    <div>
      <Header />       
      <header>
        <h1 className="text-5xl font-bold py-4 hover:text-gray-700">
                {props.story.name}
        </h1>

      </header>
 
      <main>            
             
                            <div
                            className="font-serif text-xl leading-9"
                            dangerouslySetInnerHTML={{
                              __html: marked(props.story.content.long_text)
                            }}></div>


      </main>
    </div>
  )
}
 
export async function getServerSideProps(ctx) {

    console.log( ctx.query );

  // the slug of the story
  let slug = `article/${ctx.query.slug}`;
  // the storyblok params
  let params = {
    version: "draft", // or 'published'
  }
 
  // checks if Next.js is in preview mode
  if (ctx) {
    // loads the draft version
    params.version = "published"
    // appends the cache version to get the latest content
    params.cv = Date.now()
  }
 
  // loads the story from the Storyblok API
  let { data } = await Storyblok.get(`cdn/stories/${slug}`, params)

 
  // return the story from Storyblok and whether preview mode is active
  return {
    props: {
      story: data ? data.story : false
    }
  }
}