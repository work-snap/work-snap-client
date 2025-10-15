export default function WorkplaceListSkeleton() {
  return (
    <>
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 mt-4 px-4 pb-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-4 border border-gray2 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
      <div className="w-full px-4 py-4 bg-white">
        <div className="w-full h-[60px] bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    </>
  );
}
