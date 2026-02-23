"use client"

import dynamic from "next/dynamic"

const Vacoweeper = dynamic(() => import("@/components/vacoweeper"), { ssr: false })

export default function Page() {
  return <Vacoweeper />
  
}
