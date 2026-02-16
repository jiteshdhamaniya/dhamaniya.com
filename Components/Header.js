import React from 'react';
import Head from 'next/head'
import Link from 'next/link';

export default function Header({children}) {
  return (
      <>
            <Head>
                <meta name="description" content="Personal Blog By Jitesh Dhamaniya" />
                <link rel="shortcut icon" href="http://www.gravatar.com/avatar/c670ffedd4b69670b45d0ceae7f71cfa?s=16" />
                {children}
            </Head>

            <div className="text-2xl flex items-center justify-between mb-10"> 
                <Link href="/">
                    <div className="md:flex cursor-pointer">
                        <span> Jitesh Dhamaniya </span>
                        <span className="site-description text-gray-500 font-serif font-thin">Life, Philosophy, Science. </span> 
                    </div>   
                </Link>
                <div className="flex items-center space-x-4">
                    <Link href="/tools">
                        <span className="text-base text-gray-500 hover:text-black cursor-pointer no-underline-link">Tools</span>
                    </Link>
                    <a className="no-underline-link" href="https://twitter.com/JiteshDhamaniya" target="_blank">
                        <img src="https://img.icons8.com/color/48/000000/twitter--v1.png"/>
                    </a>
                </div>
            </div>

        </>            
    );
}
