import React from 'react';
import Link from 'next/link';
import { ClockIcon as ClockLineIcon } from '@heroicons/react/outline'
import date from 'date-and-time';

import {decode} from 'html-entities';

export function getWordStr(str,wordCount) {
  return str.split(/\s+/).slice(0,wordCount).join(" ");
}

export default function PostComponent(props) {

  const year = date.format(new Date(props.post.date), 'YYYY');
  const month = date.format(new Date(props.post.date), 'MM');
  const day = date.format(new Date(props.post.date), 'DD');

  const link = "/" + year + "/" + month + "/" + day + "/" + props.post.slug;

  const excerpt = getWordStr(props.post.content.rendered,100);

  return (
      <div className="py-5 rounded space-y-2 leading-9">
          <Link href={link}>
            <div>
              <h3 className="text-5xl font-bold py-4 hover:text-gray-700 cursor-pointer">
                  {decode(props.post.title.rendered)}
              </h3>
                  
                  <div className="md:flex md:space-x-2 items-center pt-2">
                      <div className="flex items-center space-x-2"> 
                        <ClockLineIcon className="h-5 w-5 text-gray-400"/> 
                        <span> { date.format(new Date(props.post.date), 'ddd, MMM DD, YYYY') } </span>
                      </div>
                    </div>

            </div>                                                           
          </Link>

          <div className="font-serif text-xl leading-10 text-gray-700"
            dangerouslySetInnerHTML={ { __html: excerpt } }
          >
          </div>

          <div className="pt-5 link">
              <Link href={link}> 
                  Continue Reading                              
              </Link> 
            </div>
      </div>
  );
}
