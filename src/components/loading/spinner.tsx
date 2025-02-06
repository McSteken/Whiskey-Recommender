import React from 'react'
import Image from "next/image";


export default function spinner() {
  return (
    <div className='flex justify-center items-center'>
        <Image
            className="animate-spin"
            src="/loading.svg"
            alt="Next.js logo"
            width={100}
            height={38}
            priority
        />
        
        </div>
  )
}
