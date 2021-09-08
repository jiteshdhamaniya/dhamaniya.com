import React from 'react';
import Link from 'next/link';
import { ClockIcon as ClockLineIcon } from '@heroicons/react/outline'
import date from 'date-and-time';

import { DocumentRenderer } from '@keystone-next/document-renderer';

import componentBlockRenderers from './componentBlockRenderers';

export default function PostComponent(props) {

  const year = date.format(new Date(props.post.publishDate), 'YYYY');
  const month = date.format(new Date(props.post.publishDate), 'MM');
  const day = date.format(new Date(props.post.publishDate), 'DD');

  const link = "/" + year + "/" + month + "/" + day + "/" + props.post.slug;

  return (
      <div className="py-5 rounded space-y-2 leading-9">
                            <Link href={link}>
                              <div>
                                <h3 className="text-5xl font-bold py-4 hover:text-gray-700 cursor-pointer">
                                    {props.post.title}
                                </h3>
                                    <div className="flex space-x-2 items-center">
                                        <ClockLineIcon className="h-5 w-5 text-gray-400"/> 
                                        <p> { date.format(new Date(props.post.publishDate), 'ddd, MMM DD, YYYY') } </p>
                                    </div>
                              </div>                                                           
                            </Link>

                            <div className="font-serif text-xl leading-10 text-gray-700">
                              <DocumentRenderer 
                              document={props.post.content.document}
                              componentBlocks={componentBlockRenderers}                              
                              />
                            </div>

                            <div className="pt-5 link">
                                <Link href={props.post.slug}> 
                                    Continue Reading                              
                                </Link> 
                             </div>
                    </div>
  );
}
