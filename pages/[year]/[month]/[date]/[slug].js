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

export default function Single() {

  const router = useRouter();
  const slug = router.query.slug;

  const [featuredImage, setFeaturedImage] = useState(false)

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}posts/?slug=${slug}`

  const { data, error } = useSWR(url,fetcher);
    
  if (error) return <div>failed to load</div>
  if (!data) return <div>Loading...</div>

    let post = data[0];
    let { title, content, featured_media } = post;
    content = content.rendered;
     
    fetchMedia(featured_media).then(data => setFeaturedImage(data))

     return <div> 

            <Header />  
            <Head>
                <title>{title.rendered + ' ~ Jitesh Dhamaniya'}</title>
                <meta name="title" content={title.rendered + ' ~ Jitesh Dhamaniya'} />                                
                <meta name="description" content={getWordStr(content, 70).replace(/(<([^>]+)>)/gi, "")} />
                <meta name="author" content="Jitesh Dhamaniya"></meta>
                <meta name="og:title" content={title.rendered + ' ~ Jitesh Dhamaniya'} />                                
                <meta name="og:description" content={getWordStr(content, 70).replace(/(<([^>]+)>)/gi, "")} />
                { featuredImage && <meta name="og:image" content={featuredImage} /> }  
            </Head>   
          
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
 