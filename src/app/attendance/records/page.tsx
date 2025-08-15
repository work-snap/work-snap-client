"use client";

import React, { useState, useCallback } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DateRangePicker,
  Pagination,
} from "@heroui/react";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Grid3X3,
  List,
  TableIcon,
} from "lucide-react";
import { AttendanceRecordList, AttendanceRecordViewType } from "@/src/components/AttendanceRecord";
import { AttendanceRecord } from "@/src/services/attendanceService";
import { mockAttendanceRecords } from "../components/mockData";

export default function AttendanceRecordsPage() {
  const [viewType, setViewType] = useState<AttendanceRecordViewType>("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const recordsPerPage = 10;

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter, dateRange);
  }, [statusFilter, dateRange]);

  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
    applyFilters(searchTerm, status, dateRange);
  }, [searchTerm, dateRange]);

  const handleDateRangeChange = useCallback((range: { start: Date; end: Date } | null) => {
    setDateRange(range);
    applyFilters(searchTerm, statusFilter, range);
  }, [searchTerm, statusFilter]);

  const applyFilters = useCallback((term: string, status: string, range: { start: Date; end: Date } | null) => {
    let filtered = mockAttendanceRecords;

    // 검색 필터
    if (term) {
      filtered = filtered.filter(record =>
        record.employeeName.toLowerCase().includes(term.toLowerCase()) ||
        record.workLocation?.toLowerCase().includes(term.toLowerCase()) ||
        record.notes?.toLowerCase().includes(term.toLowerCase())
      );
    }

    // 상태 필터
    if (status !== "all") {
      filtered = filtered.filter(record => record.status === status);
    }

    // 날짜 범위 필터
    if (range) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.workDate);
        return recordDate >= range.start && recordDate <= range.end;
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, []);

  const handleViewRecord = useCallback((record: AttendanceRecord) => {
    console.log(`상세보기: ${record.employeeName} - ${record.workDate}`);
  }, []);

  const handleEditRecord = useCallback((record: AttendanceRecord) => {
    console.log(`수정: ${record.employeeName} - ${record.workDate}`);
  }, []);

  const handleDeleteRecord = useCallback((record: AttendanceRecord) => {
    if (confirm(`${record.employeeName}의 ${record.workDate} 기록을 삭제하시겠습니까?`)) {
      setFilteredRecords(prev => prev.filter(r => r.id !== record.id));
      console.log("기록이 삭제되었습니다.");
    }
  }, []);

  const handleExportData = useCallback(() => {
    console.log("엑셀 내보내기 기능은 추후 구현됩니다.");
  }, []);

  const goBack = () => {
    window.history.back();
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const getViewIcon = (type: AttendanceRecordViewType) => {
    switch (type) {
      case "card": return <Grid3X3 className="w-4 h-4" />;
      case "list": return <List className="w-4 h-4" />;
      case "table": return <TableIcon className="w-4 h-4" />;
      default: return <Grid3X3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="light"
                size="sm"
                startContent={<ArrowLeft className="w-4 h-4" />}
                onClick={goBack}
              >
                뒤로
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">출석 기록 관리</h1>
                <p className="text-sm text-gray-600">출석 기록 조회, 수정, 삭제 관리</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="bordered"
                startContent={<Download className="w-4 h-4" />}
                onClick={handleExportData}
              >
                엑셀 내보내기
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 필터 및 검색 영역 */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">필터 및 검색</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                총 {filteredRecords.length}개 기록
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 검색 */}
              <Input
                placeholder="이름, 위치, 메모 검색..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                clearable
              />

              {/* 상태 필터 */}
              <Select
                placeholder="상태 선택"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  handleStatusFilter(selected || "all");
                }}
              >
                <SelectItem key="all" value="all">전체</SelectItem>
                <SelectItem key="PRESENT" value="PRESENT">출석</SelectItem>
                <SelectItem key="LATE" value="LATE">지각</SelectItem>
                <SelectItem key="ABSENT" value="ABSENT">결근</SelectItem>
                <SelectItem key="EARLY_LEAVE" value="EARLY_LEAVE">조퇴</SelectItem>
              </Select>

              {/* 날짜 범위 선택 */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="bordered"
                  startContent={<Calendar className="w-4 h-4" />}
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    handleDateRangeChange({ start: weekAgo, end: today });
                  }}
                >
                  최근 7일
                </Button>
                <Button
                  variant="bordered"
                  onClick={() => {
                    const today = new Date();
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    handleDateRangeChange({ start: monthAgo, end: today });
                  }}
                >
                  최근 30일
                </Button>
              </div>

              {/* 뷰 타입 선택 */}
              <div className="flex items-center space-x-2">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="bordered"
                      startContent={getViewIcon(viewType)}
                    >
                      {viewType === "card" ? "카드" : 
                       viewType === "list" ? "리스트" : "테이블"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem
                      key="card"
                      onClick={() => setViewType("card")}
                      startContent={<Grid3X3 className="w-4 h-4" />}
                    >
                      카드 뷰
                    </DropdownItem>
                    <DropdownItem
                      key="list"
                      onClick={() => setViewType("list")}
                      startContent={<List className="w-4 h-4" />}
                    >
                      리스트 뷰
                    </DropdownItem>
                    <DropdownItem
                      key="table"
                      onClick={() => setViewType("table")}
                      startContent={<TableIcon className="w-4 h-4" />}
                    >
                      테이블 뷰
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 출석 기록 목록 */}
        <AttendanceRecordList
          records={currentRecords}
          viewType={viewType}
          loading={loading}
          onView={handleViewRecord}
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
          emptyMessage="조건에 맞는 출석 기록이 없습니다."
        />

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
              showControls
              showShadow
            />
          </div>
        )}
      </div>
    </div>
  );
}