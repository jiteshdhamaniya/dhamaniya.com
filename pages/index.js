import Head from 'next/head'
import Image from 'next/image'
import marked from 'marked';

// The Storyblok Client
import Storyblok from "../lib/storyblok"
import Header from '../Components/Header'

import date from 'date-and-time';
import PostComponent from '../Components/PostComponent';
import { useRouter } from 'next/router';
import { request } from 'graphql-request';
import useSWR from 'swr'
import { ClockIcon as ClockLineIcon } from '@heroicons/react/outline'


export default function Home(props) {

  const fetcher = query => request('http://localhost:3000/api/graphql', query);
  const router = useRouter();
  const slug = router.query.slug;
  const { data, error } = useSWR(
    `{
      allPosts{
        id
        title,
        slug,
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

  return (
    <div className="">
          <Header />        
          <main>            
            { data.allPosts.map((item,i)=> <PostComponent post={item} key={i} />)}                            
          </main>
    </div>
  )
}
