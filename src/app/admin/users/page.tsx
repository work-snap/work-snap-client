"use client";

import React, { useState, useMemo } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  useUsers,
  useDeleteUser,
  useExportUsers,
  useUserStats,
} from "@/src/lib/users/users.query";
import type { User, UserRole, UserStatus } from "@/src/lib/users/types";

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pageSize] = useState(10);

  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const itemsPerPage = 10;

  // 역할별 색상 매핑
  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "ADMIN":
        return "danger";
      case "BUSINESS_OWNER":
        return "primary";
      case "PART_TIME_WORKER":
        return "success";
      default:
        return "default";
    }
  };

  // 상태별 색상 매핑
  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "danger";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  // 필터링된 사용자 목록
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // 페이지네이션
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 액션 핸들러
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    onDetailOpen();
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      onDeleteClose();
      setSelectedUser(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
              <p className="text-gray-600 mt-1">시스템 사용자 관리 및 권한 설정</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="bordered"
                startContent={
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                }
              >
                새로고침
              </Button>
              <Button
                variant="bordered"
                startContent={<Download className="w-4 h-4" />}
              >
                내보내기
              </Button>
              <Button
                onClick={onCreateOpen}
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
              >
                사용자 추가
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 검색 및 필터 */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="사용자명 또는 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                className="flex-1"
              />
              <Select
                placeholder="역할 선택"
                selectedKeys={[selectedRole]}
                onSelectionChange={(keys) =>
                  setSelectedRole(Array.from(keys)[0] as string)
                }
                className="w-48"
              >
                <SelectItem key="all">모든 역할</SelectItem>
                <SelectItem key="ADMIN">관리자</SelectItem>
                <SelectItem key="BUSINESS_OWNER">사업주</SelectItem>
                <SelectItem key="PART_TIME_WORKER">알바생</SelectItem>
              </Select>
              <Select
                placeholder="상태 선택"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) =>
                  setSelectedStatus(Array.from(keys)[0] as string)
                }
                className="w-48"
              >
                <SelectItem key="all">모든 상태</SelectItem>
                <SelectItem key="ACTIVE">활성</SelectItem>
                <SelectItem key="INACTIVE">비활성</SelectItem>
                <SelectItem key="PENDING">대기</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* 사용자 테이블 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                사용자 목록 ({filteredUsers.length}명)
              </h3>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            ) : (
              <Table aria-label="사용자 테이블">
                <TableHeader>
                  <TableColumn>사용자 정보</TableColumn>
                  <TableColumn>역할</TableColumn>
                  <TableColumn>상태</TableColumn>
                  <TableColumn>가입일</TableColumn>
                  <TableColumn>최근 로그인</TableColumn>
                  <TableColumn>액션</TableColumn>
                </TableHeader>
                <TableBody emptyContent="사용자가 없습니다.">
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip color={getRoleColor(user.role)} size="sm">
                          {user.role === "ADMIN"
                            ? "관리자"
                            : user.role === "BUSINESS_OWNER"
                            ? "사업주"
                            : "알바생"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip color={getStatusColor(user.status)} size="sm">
                          {user.status === "ACTIVE"
                            ? "활성"
                            : user.status === "INACTIVE"
                            ? "비활성"
                            : "대기"}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.lastLoginAt
                          ? formatDate(user.lastLoginAt)
                          : "미접속"}
                      </TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              key="view"
                              startContent={<Eye className="w-4 h-4" />}
                              onClick={() => handleViewUser(user)}
                            >
                              상세보기
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              startContent={<Edit className="w-4 h-4" />}
                            >
                              수정
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Trash2 className="w-4 h-4" />}
                              onClick={() => handleDeleteUser(user)}
                            >
                              삭제
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center p-4">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* 사용자 상세보기 모달 */}
      <Modal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>사용자 상세 정보</ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      사용자명
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.username}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      이메일
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      역할
                    </label>
                    <div className="mt-1">
                      <Chip color={getRoleColor(selectedUser.role)} size="sm">
                        {selectedUser.role === "ADMIN"
                          ? "관리자"
                          : selectedUser.role === "BUSINESS_OWNER"
                          ? "사업주"
                          : "알바생"}
                      </Chip>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      상태
                    </label>
                    <div className="mt-1">
                      <Chip color={getStatusColor(selectedUser.status)} size="sm">
                        {selectedUser.status === "ACTIVE"
                          ? "활성"
                          : selectedUser.status === "INACTIVE"
                          ? "비활성"
                          : "대기"}
                      </Chip>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      가입일
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      최근 로그인
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.lastLoginAt
                        ? formatDate(selectedUser.lastLoginAt)
                        : "미접속"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onClick={onDetailClose}>
              닫기
            </Button>
            <Button color="primary" startContent={<Edit className="w-4 h-4" />}>
              수정
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>사용자 삭제</ModalHeader>
          <ModalBody>
            <p>
              정말로 <strong>{selectedUser?.username}</strong> 사용자를
              삭제하시겠습니까?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onClick={onDeleteClose}>
              취소
            </Button>
            <Button color="danger" onClick={confirmDelete}>
              삭제
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 사용자 생성 모달 - 간단한 버전 */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="2xl">
        <ModalContent>
          <ModalHeader>새 사용자 추가</ModalHeader>
          <ModalBody>
            <div className="text-center py-8">
              <p className="text-gray-500">
                사용자 생성 폼이 여기에 구현될 예정입니다.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onClick={onCreateClose}>
              취소
            </Button>
            <Button color="primary" onClick={onCreateClose}>
              생성
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}