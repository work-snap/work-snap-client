"use client";

import Image from "next/image";

export default function Benner() {
  return (
    <div className="flex justify-center items-center">
      <Image
        src="/benner.png"
        alt="배너 일러스트"
        width={400}
        height={400}
        priority
      />
    </div>
  );
}
