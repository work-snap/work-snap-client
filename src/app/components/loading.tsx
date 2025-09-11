export default function Loading() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-white max-w-[430px] w-full mx-auto px-4">
      <div className="mb-6">
        <svg
          className="animate-spin h-12 w-12 text-main"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-[18px] font-semibold text-gray5 leading-tight mb-2">
          정보를 확인하고 있습니다
        </span>
        <span className="text-[14px] text-gray-400">잠시만 기다려주세요</span>
      </div>
    </div>
  );
}
