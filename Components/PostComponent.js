import React from 'react';
import Link from 'next/link';
import { ClockIcon as ClockLineIcon } from '@heroicons/react/outline'
import date from 'date-and-time';
import marked from 'marked';


export default function PostComponent(props) {

  return (
    <div className="py-5 rounded space-y-2 leading-9">
                            <Link href={props.post.url}>
                              <div>
                                <h3 className="text-5xl font-bold py-4 hover:text-gray-700 cursor-pointer">
                                    {props.post.name}
                                </h3>
                                    <div className="flex space-x-2 items-center">
                                        <ClockLineIcon className="h-5 w-5 text-gray-400"/> 
                                        <p> { date.format(new Date(props.post.first_published_at), 'ddd, MMM DD, YYYY') } </p>
                                    </div>
                              </div>                                                           
                            </Link>
                              
                            <div
                            className="font-serif text-xl leading-9"
                            dangerouslySetInnerHTML={{
                              __html: marked(props.post.content.intro)
                            }}></div>

                            <div className="pt-5">
                                <Link href={props.post.url}> 
                                    Continue Reading                              
                                </Link> 
                             </div>
                    </div>
  );
}
