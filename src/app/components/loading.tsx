export default function Loading() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-white max-w-[430px] w-full mx-auto px-4">
      <div className="w-full flex justify-center items-center mt-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray2 border-t-main rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
