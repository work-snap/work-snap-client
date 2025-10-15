import Benner from "@/src/app/components/benner";
import WorkplaceListSkeleton from "./WorkplaceListSkeleton";

export default function Loading() {
  return (
    <div className="h-dvh min-h-0 flex flex-col max-w-[430px] w-full mx-auto bg-white">
      <div className="flex-shrink-0">
        <Benner />
      </div>
      <WorkplaceListSkeleton />
    </div>
  );
}
