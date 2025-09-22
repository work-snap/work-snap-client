"use client";

import Image from "next/image";

export default function Benner() {
  return (
    <div className="flex justify-center items-center w-full h-40 overflow-hidden px-4">
      <Image
        src="/benner.png"
        alt="배너 일러스트"
        width={400}
        height={128}
        priority
        className="w-full h-full"
      />
    </div>
  );
}
