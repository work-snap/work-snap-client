"use client";

import Image from "next/image";

export default function Benner() {
  return (
    <div className="flex justify-center items-center w-full h-40 overflow-hidden px-4">
      <Image
        src="/benner.png"
        alt="배너 일러스트"
        width={400}
        height={160}
        priority
        quality={75}
        fetchPriority="high"
        loading="eager"
        sizes="(max-width: 430px) 100vw, 430px"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
