"use client";

import { useMemo } from "react";
import { WorkplaceSummary } from "@/lib/api/getMyWP";
import { Select, SelectItem } from "@heroui/react";

interface ColorWorkplaceDropdownProps {
  workplaces: WorkplaceSummary[];
  selectedWorkplaceId: number | null;
  onChange: (workplaceId: number) => void;
  label?: string;
}

export default function ColorWorkplaceDropdown({
  workplaces,
  selectedWorkplaceId,
  onChange,
  label = "사업장을 선택하세요",
}: ColorWorkplaceDropdownProps) {
  // key 경고 방지용 중복 제거
  const uniqueWorkplaces = useMemo(() => {
    const dedup = new Map<number, WorkplaceSummary>();
    workplaces.forEach((w) => {
      if (!dedup.has(w.id)) dedup.set(w.id, w);
    });
    return Array.from(dedup.values());
  }, [workplaces]);
  const getColorFromIndex = (index: number) => {
    const colors = [
      "#eeace3",
      "#fcdd2c",
      "#08fd31",
      "#44d1fc",
      "#b700ff",
      "#ccc",
    ];
    return colors[index % colors.length];
  };

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
      renderValue={(items) => {
        const selectedItem = items[0];
        if (selectedItem) {
          const workplace = uniqueWorkplaces.find(
            (w) => String(w.id) === selectedItem.key
          );
          if (workplace) {
            return (
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: getColorFromIndex(
                      workplace.workplaceColorIndex ?? 5
                    ),
                  }}
                ></span>
                {workplace.workplaceName}
              </div>
            );
          }
        }
        return label;
      }}
      // HeroUI 안정성 최적화 적용
      disableAnimation={true}
      classNames={{
        trigger: "border-gray2 bg-white rounded-xl px-4 py-3",
        value: "text-left",
        popoverContent: "rounded-xl border-gray2 shadow-lg",
      }}
    >
      {uniqueWorkplaces.map((workplace) => (
        <SelectItem key={String(workplace.id)}>
          <div className="flex gap-2 items-center rounded-lg">
            <span
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: getColorFromIndex(
                  workplace.workplaceColorIndex ?? 5
                ),
              }}
            ></span>
            {workplace.workplaceName}
          </div>
        </SelectItem>
      ))}
    </Select>
  );
}
