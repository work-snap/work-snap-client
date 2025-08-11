"use client";

import DayTimePicker from "./components/DayTimePicker";

export default function TestPickerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white max-w-[430px] w-full mx-auto px-3 sm:px-4 pb-28">
      <h1 className="text-main2 text-lg font-semibold mb-4">
        타임 피커 테스트
      </h1>
      <DayTimePicker />
    </div>
  );
}
