import React from 'react';
import Head from 'next/head'

export default function Header() {
  return (
      <>
            <Head>
                <title>Jitesh Dhamaniya - Life, Philosophy, Science.</title>
                <meta name="description" content="Personal Blog By Jitesh Dhamaniya" />
                <link rel="shortcut icon" href="http://www.gravatar.com/avatar/c670ffedd4b69670b45d0ceae7f71cfa?s=16" />
            </Head>

            <div className="text-2xl flex items-center"> 
                Jitesh Dhamaniya <p className="site-description text-gray-500 font-serif font-thin">Life, Philosophy, Science. </p> 
            </div>

        </>            
    );
}
