import React from 'react';
import Head from 'next/head'

export default function Header() {
  return (
      <>
            <Head>
                <title>Jitesh Dhamaniya - Life, Philosophy, Science.</title>
                <meta name="description" content="Personal Blog By Jitesh Dhamaniya" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="text-2xl flex items-center"> 
                Jitesh Dhamaniya <p className="site-description text-gray-500 font-serif font-thin">Life, Philosophy, Science. </p> 
            </div>

        </>            
    );
}
