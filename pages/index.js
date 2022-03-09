
import Header from '../Components/Header'

import PostComponent from '../Components/PostComponent';

export default function Home({posts}) {
  return (
    <div>
          <Header>
                <title>Jitesh Dhamaniya &#8211; Life, Philosophy, Science.</title>
                <meta name="title" content='Jitesh Dhamaniya - Life, Philosophy, Science.' />                                
                <meta name="description" content='I share my personal thoughts and experiences here about Life, Philosophy, and Science.' />
                <meta name="author" content="Jitesh Dhamaniya"></meta>
                <meta property="og:title" content='A Personal Blog By Jitesh Dhamaniya' />                                
                <meta property="og:description" content='I share my personal thoughts and experiences here about Life, Philosophy, and Science.' />
                <meta property="og:image" content='https://scontent.fjai6-1.fna.fbcdn.net/v/t39.30808-6/273294687_10219213017931767_8026042335538401293_n.jpg?_nc_cat=106&ccb=1-5&_nc_sid=e3f864&_nc_ohc=oXBWWMyh2h8AX8RiSbs&_nc_ht=scontent.fjai6-1.fna&oh=00_AT_7nKegQIssra4sDq2zcyu6yzlfWW-UUGcfvJDWUkX75g&oe=62066184' />  
            </Header>                              
          <main>{posts.map((item,i) => <PostComponent post={item} key={i} />)}</main>
    </div>
  )
}

// This function gets called at build time
export async function getStaticProps() {

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}posts/`
  let posts = await fetch(url)
  posts = await posts.json()
  
  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      posts
    },
  }
}

