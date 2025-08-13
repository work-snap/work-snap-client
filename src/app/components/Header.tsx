import { useUser } from "@/lib/queries/useUser";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: user } = useUser();
  const userType = user?.data.userType ?? "PART_TIME_WORKER"; // 기본값 PARTIME_WORKER
  const pathname = usePathname();

  const roleLabel = userType === "PART_TIME_WORKER" ? "알바님" : "사장님";
  const roleBgClass = userType === "PART_TIME_WORKER" ? "bg-main2" : "bg-main";

  return (
    <header className="flex items-center justify-between px-4 pt-6 pb-3">
      <h1 className="text-[26px] font-extrabold text-main tracking-tight">
        Work Snap
      </h1>
      <div className="flex items-center gap-2">
        <span className="text-[18px] font-bold text-gray5">
          {user?.data.nickname}
        </span>
        <span
          className={`${roleBgClass} text-gray1 text-xs font-semibold rounded-full px-2 py-1`}
        >
          {roleLabel}
        </span>
      </div>
    </header>
  );
}
