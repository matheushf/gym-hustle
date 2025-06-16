import React from 'react'
import { LoaderIcon } from "lucide-react";

export default function FullLoader() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
          <h1 className="text-2xl font-bold text-primary mb-4">Gym Hustle</h1>
          <LoaderIcon className="animate-spin" size={32} />
        </div>
  )
}
