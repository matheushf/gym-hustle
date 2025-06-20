import React from "react";
import { LoaderIcon } from "lucide-react";

export default function FullLoader() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <LoaderIcon className="animate-spin" size={32} />
    </div>
  );
}
