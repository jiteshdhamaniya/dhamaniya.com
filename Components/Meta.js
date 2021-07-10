import React from 'react';
import { ClockIcon } from '@heroicons/react/solid'
import { ClockIcon as ClockLineIcon } from '@heroicons/react/outline'

export default function Meta(props) {
  return (
            <div className="flex space-x-4">

         <div className="flex space-x-2 items-center">
            <ClockIcon className="h-5 w-5 text-gray-400"/> 
            <p> { props.published_date } </p>
         </div>

         { props.last_updated && 
            <div className="flex space-x-2 items-center">
                <ClockLineIcon className="h-5 w-5 text-gray-400"/> 
                <p> { props.last_updated } </p>
            </div>
        }

         </div>
  );
}
