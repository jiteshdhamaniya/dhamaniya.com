import dynamic from 'next/dynamic'

import { ClockIcon as ClockLineIcon } from '@heroicons/react/outline'
import { ClockIcon as ClockSolidIcon } from '@heroicons/react/solid'

import Header from "../../../../Components/Header";

import dateLib from 'date-and-time';

import {decode} from 'html-entities';

import { getWordStr } from "../../../../Components/PostComponent"

import { getAllPosts, getPostBySlug } from "../../../../lib/posts"

const CommentBox = dynamic(() => import("../../../../Components/CommentFacebook"),{ ssr: false });

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
                                          <span> { dateLib.format(new Date(post.date), 'ddd, MMM DD, YYYY') } </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                          <ClockSolidIcon className="h-5 w-5 text-gray-400"/>
                                          <span> { dateLib.format(new Date(post.modified), 'ddd, MMM DD, YYYY') } </span>
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
  const slug = ctx.params.slug
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      post
    },
    revalidate: 60
  }
}

export async function getStaticPaths() {
  const posts = await getAllPosts()

  const allPosts = posts.map(post => {
    const postDate = new Date(post.date)
    const year = dateLib.format(postDate, 'YYYY')
    const month = dateLib.format(postDate, 'MM')
    const day = dateLib.format(postDate, 'DD')

    return {
      params: {
        slug: post.slug,
        year,
        month,
        date: day
      }
    }
  })

  return {
    paths: allPosts,
    fallback: 'blocking'
  }
}