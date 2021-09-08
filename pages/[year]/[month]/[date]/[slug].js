import Head from "next/head"

import dynamic from 'next/dynamic'

import { ClockIcon as ClockLineIcon } from '@heroicons/react/outline'
import { ClockIcon as ClockSolidIcon } from '@heroicons/react/solid'

import useSWR from 'swr'
import { useRouter } from 'next/router';

import { useEffect } from 'react';

import Header from "../../../../Components/Header";

import date from 'date-and-time';

import {decode} from 'html-entities';

const CommentBox = dynamic(() => import("../../../../Components/CommentFacebook"),{ ssr: false });

export default function Single() {

  const fetcher = url => fetch(url).then(r => r.json())

  const router = useRouter();
  const slug = router.query.slug;

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}?slug=${slug}`

  const { data, error } = useSWR(url,fetcher);
    
  if (error) return <div>failed to load</div>
  if (!data) return <div>Loading...</div>

    let post = data[0];
    let { title, content } = post;

     content = content.rendered;

     return <div> 

            <Header />  
            <Head>
                <title>{title.rendered}</title>
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
 