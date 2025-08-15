"use client";

import { useMemo } from "react";
import { WorkplaceSummary } from "@/lib/api/getMyWP";
import { Select, SelectItem } from "@heroui/react";

interface WorkplaceDropdownProps {
  workplaces: WorkplaceSummary[];
  selectedWorkplaceId: number | null;
  onChange: (workplaceId: number) => void;
  label?: string;
}

export default function WorkplaceDropdown({
  workplaces,
  selectedWorkplaceId,
  onChange,
  label = "사업장을 선택하세요",
}: WorkplaceDropdownProps) {
  // key 경고 방지용 중복 제거
  const uniqueWorkplaces = useMemo(() => {
    const dedup = new Map<number, WorkplaceSummary>();
    workplaces.forEach((w) => {
      if (!dedup.has(w.id)) dedup.set(w.id, w);
    });
    return Array.from(dedup.values());
  }, [workplaces]);

  return (
    <Select
      selectedKeys={selectedWorkplaceId ? [String(selectedWorkplaceId)] : []}
      onSelectionChange={(keys) => {
        const selectedKey = Array.from(keys)[0] as string;
        if (selectedKey && onChange) {
          onChange(Number(selectedKey));
        }
      }}
      placeholder={label}
      aria-label={label}
      // HeroUI 안정성 최적화 적용
      disableAnimation={true}
      classNames={{
        trigger: "border-gray2 bg-white rounded-xl px-4 py-3",
        value: "text-left",
        popoverContent: "rounded-xl border-gray2 shadow-lg"
      }}
    >
      {uniqueWorkplaces.map((workplace) => (
        <SelectItem key={String(workplace.id)} value={String(workplace.id)}>
          {workplace.workplaceName}
        </SelectItem>
      ))}
    </Select>
  );
}
