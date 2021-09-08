import { useEffect, memo } from "react";

const CommentsFacebook =(props) => {
   useEffect(() => {
      if(window.FB){
            window.FB.XFBML.parse();
         }
      const facebookScript = document.createElement("script");
      facebookScript.async = true;
      facebookScript.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v7.0&appId=${process.env.FACEBOOK_APP_ID}&autoLogAppEvents=1`;
      document.body.appendChild(facebookScript);
   },[]);

   return (
      <>   
         <div id="fb-root"></div>
         <div className="fb-comments" data-href={process.env.FACEBOOK_APP_ID} data-numposts="10" data-width="100%"></div>
      </>
   );
};

export default CommentsFacebook;