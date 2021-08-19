import Head from "next/head"
// import marked from 'marked';

import { DocumentRenderer } from '@keystone-next/document-renderer';
import { ClockIcon as ClockLineIcon } from '@heroicons/react/outline'

import useSWR from 'swr'
import { useRouter } from 'next/router';

// The Storyblok Client
// import Storyblok from '../../../../lib/storyblok';
import Header from "../../../../Components/Header";

import date from 'date-and-time';
import Meta from "../../../../Components/Meta";

import { request } from 'graphql-request';

export default function Single() {

  const fetcher = query => request('http://localhost:3000/api/graphql', query);
  const router = useRouter();
  const slug = router.query.slug;
  const { data, error } = useSWR(
    `{
      Post(where:{slug:"${slug}"}){
        id
        title,
        content{
          document
        }
        publishDate,
        updatedDate
      }
    }`,
    fetcher
  );
    
    if (error) return <div>failed to load</div>
    if (!data) return <div>Loading...</div>

     return <div> 
            <Header />  
            <Head>
                <title>{data.Post.title}</title>
            </Head>   
            
            <div className="py-5 rounded space-y-2 leading-9">
                              <div>
                                <h3 className="text-5xl font-bold py-4 hover:text-gray-700 cursor-pointer">
                                    {data.Post.title}
                                </h3>
                                    <div className="flex space-x-2 items-center">
                                        <ClockLineIcon className="h-5 w-5 text-gray-400"/> 
                                        <p> { date.format(new Date(data.Post.publishDate), 'ddd, MMM DD, YYYY') } </p>
                                    </div>
                              </div>                                                           
                            
                            <div className="font-serif text-xl leading-10 text-gray-700">
                              <DocumentRenderer document={data.Post.content.document} />
                            </div>
 
                    </div>

        </div>
}
 