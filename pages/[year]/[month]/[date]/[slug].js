import Head from "next/head"
import dynamic from 'next/dynamic'

import { ClockIcon as ClockLineIcon } from '@heroicons/react/outline'
import { ClockIcon as ClockSolidIcon } from '@heroicons/react/solid'

import useSWR from 'swr'
import { useRouter } from 'next/router';

import Header from "../../../../Components/Header";

import date from 'date-and-time';

import {decode} from 'html-entities';

import { getWordStr } from "../../../../Components/PostComponent"
import { useState } from "react"

const CommentBox = dynamic(() => import("../../../../Components/CommentFacebook"),{ ssr: false });

const fetchMedia = (id) => {
  const mediaURL =  `${process.env.NEXT_PUBLIC_BASE_URL}media/${id}`
  let featuredImage
  return fetch(mediaURL).then(response => response.json()).then(data => featuredImage = data.source_url)      
}

const fetcher = url => fetch(url).then(r => r.json())

export default function Single({post}) {

  if(!post) return <></>

    let { title, content, featuredImage } = post;
    content = content.rendered;    
   
     return <div> 
            <Header>
                <title>{title.rendered} &#8211; Jitesh Dhamaniya</title>
                <meta name="title" content={`${title.rendered} - Jitesh Dhamaniya`} />                                
                <meta name="description" content={getWordStr(content, 70).replace(/(<([^>]+)>)/gi, "")} />
                <meta name="author" content="Jitesh Dhamaniya"></meta>
                <meta property="og:title" content={title.rendered + ' ~ Jitesh Dhamaniya'} />                                
                <meta property="og:description" content={getWordStr(content, 70).replace(/(<([^>]+)>)/gi, "")} />
                { featuredImage && <meta property="og:image" content={featuredImage} /> }  
            </Header>              
          
            <div className="py-5 rounded space-y-2 leading-9">
                              <div>
                                <h3 className="text-5xl font-bold py-4">
                                    {decode(title.rendered)}
                                </h3>
                                    <div className="md:flex md:space-x-2 items-center pt-2">

                                       <div className="flex items-center space-x-2"> 
                                          <ClockLineIcon className="h-5 w-5 text-gray-400"/> 
                                          <span> { date.format(new Date(post.date), 'ddd, MMM DD, YYYY') } </span>
                                        </div>
                                      
                                        <div className="flex items-center space-x-2"> 
                                          <ClockSolidIcon className="h-5 w-5 text-gray-400"/> 
                                          <span> { date.format(new Date(post.modified), 'ddd, MMM DD, YYYY') } </span>
                                        </div>
                                       
                                    </div>
                              </div>                                                           
                            
                            <div className="font-serif text-xl leading-10 text-gray-700"
                              dangerouslySetInnerHTML={ { __html: content } }
                            ></div>

                          <CommentBox />

                    </div>            
        </div>
}

// This function gets called at build time
export async function getStaticProps(ctx) {
  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time

  const slug = ctx.params.slug

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}posts/?slug=${slug}`
  let data = await fetch(url)
  data = await data.json()
  let post = data[0]
  
  const mediaId = post.featured_media

  const mediaURL =  `${process.env.NEXT_PUBLIC_BASE_URL}media/${mediaId}`
  let featured_media = await fetch(mediaURL)
  featured_media = await featured_media.json()

  const featuredImage = featured_media.source_url

  post = { ...post, featuredImage }

  return {
    props: {
      post
    },
    revalidate: 10, // In seconds
  }
}

export async function getStaticPaths() {

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}posts/`
  let posts = await fetch(url)
  posts = await posts.json()

  const allPosts = []

  posts = posts.map(async post => {

      const year = date.format(new Date(post.date), 'YYYY');
      const month = date.format(new Date(post.date), 'MM');
      const date = date.format(new Date(post.date), 'DD');
      const slug = post.slug

      allPosts.push({ params: {
        slug,
        year,
        month,
        date
      }})
  })

  return {
    paths: allPosts,
    fallback: true,
  }
}