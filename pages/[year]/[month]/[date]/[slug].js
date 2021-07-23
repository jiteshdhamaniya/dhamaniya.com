import Head from "next/head"
import marked from 'marked';

// The Storyblok Client
import Storyblok from '../../../../lib/storyblok';
import Header from "../../../../Components/Header";

import date from 'date-and-time';
import Meta from "../../../../Components/Meta";

export default function Post(props) {

    const published_date = date.format(new Date(props.story.first_published_at), 'ddd, MMM DD, YYYY'); 
    const last_updated = date.format(new Date(props.story.published_at), 'ddd, MMM DD, YYYY'); 

  return (
    <div>
        <Header />      
      <header>
        <h1 className="text-5xl font-bold py-4"> {props.story.name} </h1>
        <Meta published_date={published_date} last_updated={last_updated} />
      </header>

      <main>                         
            <div
            className="font-serif text-xl leading-9"
            dangerouslySetInnerHTML={{
            __html: marked(props.story.content.long_text)
            }}></div>
      </main>
      <div id="fb-root"></div>            
      <div 
      className="fb-comments" 
      data-href="https://developers.facebook.com/docs/plugins/comments#configurator" 
      data-width="100" 
      data-numposts="5">        
      </div>
    </div>
  )
}
 
export async function getServerSideProps(ctx) {

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