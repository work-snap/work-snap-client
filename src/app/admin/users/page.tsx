"use client";

import React, { useState, useMemo, useCallback } from "react";
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
  ChevronDown,
} from "lucide-react";
import { useAdminUsers, useAdminUserDetail, useUpdateAdminUser } from "@/src/lib/users/admin-users.query";
import type {
  AdminUserSummary,
  UserType,
  UserRole,
  VerificationStatus,
  AdminUserUpdateRequest
} from "@/src/lib/users/admin-users.types";

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<UserType | "">("");
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | "">("");
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState<VerificationStatus | "">("");
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<AdminUserUpdateRequest>({});

  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // 필터링 조건 메모이제이션
  const filters = useMemo(() => ({
    search: searchTerm || undefined,
    userType: selectedUserType || undefined,
    userRole: selectedUserRole || undefined,
    verificationStatus: selectedVerificationStatus || undefined,
    limit: 20,
  }), [searchTerm, selectedUserType, selectedUserRole, selectedVerificationStatus]);

  // 무한 스크롤 쿼리
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useAdminUsers(filters);

  // 사용자 상세 정보 쿼리
  const {
    data: userDetail,
    isLoading: isDetailLoading,
  } = useAdminUserDetail(selectedUserId || 0, !!selectedUserId);

  // 사용자 정보 수정 뮤테이션
  const updateUserMutation = useUpdateAdminUser();

  // 모든 페이지의 사용자들을 평면화
  const allUsers = useMemo(() => {
    if (!usersData?.pages) return [];
    return usersData.pages.flatMap(page => page.users);
  }, [usersData]);

  // 전체 카운트 (첫 페이지에서만 제공)
  const totalCount = usersData?.pages[0]?.pagination.totalCount;

  // 역할별 색상 매핑
  const getUserRoleColor = (role: UserRole): "danger" | "primary" | "success" | "default" => {
    switch (role) {
      case "SUPER_ADMIN":
        return "danger";
      case "ADMIN":
        return "primary";
      case "USER":
        return "success";
      default:
        return "default";
    }
  };

  // 유저 타입별 색상 매핑
  const getUserTypeColor = (type: UserType): "warning" | "primary" | "success" | "default" => {
    switch (type) {
      case "PENDING":
        return "warning";
      case "BUSINESS_OWNER":
        return "primary";
      case "PART_TIME_WORKER":
        return "success";
      default:
        return "default";
    }
  };

  // 인증 상태별 색상 매핑
  const getVerificationStatusColor = (status: VerificationStatus): "warning" | "success" | "danger" | "primary" | "default" => {
    switch (status) {
      case "NOT_REQUESTED":
        return "default";
      case "PENDING":
      case "REVIEWING":
        return "warning";
      case "APPROVED":
      case "VERIFIED":
        return "success";
      case "REJECTED":
        return "danger";
      default:
        return "default";
    }
  };

  // 액션 핸들러
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleViewUser = useCallback((user: AdminUserSummary) => {
    setSelectedUser(user);
    setSelectedUserId(user.id);
    onDetailOpen();
  }, [onDetailOpen]);

  const handleEditUser = useCallback((user: AdminUserSummary) => {
    setSelectedUser(user);
    setSelectedUserId(user.id);
    setEditFormData({
      nickname: user.nickname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
      userRole: user.userRole,
    });
    onEditOpen();
  }, [onEditOpen]);

  const handleDeleteUser = useCallback((user: AdminUserSummary) => {
    setSelectedUser(user);
    onDeleteOpen();
  }, [onDeleteOpen]);

  const handleSubmitEdit = useCallback(async () => {
    if (!selectedUserId) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: selectedUserId,
        updateData: editFormData,
      });
      onEditClose();
      setSelectedUserId(null);
      setEditFormData({});
    } catch (error) {
      console.error("사용자 정보 수정 실패:", error);
    }
  }, [selectedUserId, editFormData, updateUserMutation, onEditClose]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatUserType = useCallback((type: UserType) => {
    switch (type) {
      case "PENDING":
        return "대기중";
      case "BUSINESS_OWNER":
        return "사업자";
      case "PART_TIME_WORKER":
        return "알바생";
      default:
        return type;
    }
  }, []);

  const formatUserRole = useCallback((role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "최고관리자";
      case "ADMIN":
        return "관리자";
      case "USER":
        return "일반사용자";
      default:
        return role;
    }
  }, []);

  const formatVerificationStatus = useCallback((status: VerificationStatus) => {
    switch (status) {
      case "NOT_REQUESTED":
        return "미신청";
      case "PENDING":
        return "대기중";
      case "REVIEWING":
        return "검토중";
      case "APPROVED":
        return "승인됨";
      case "VERIFIED":
        return "인증완료";
      case "REJECTED":
        return "거부됨";
      default:
        return status;
    }
  }, []);

  if (isError) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">사용자 목록을 불러오는데 실패했습니다.</p>
          <Button onClick={handleRefresh} color="primary">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
              <p className="text-gray-600 mt-1">
                시스템 사용자 관리 및 권한 설정
                {totalCount && ` (총 ${totalCount.toLocaleString()}명)`}
              </p>
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
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
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
                placeholder="유저 타입"
                aria-label="유저 타입 필터"
                selectedKeys={selectedUserType ? [selectedUserType] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as UserType | undefined;
                  setSelectedUserType(key || "");
                }}
                className="w-48"
              >
                <SelectItem key="">모든 타입</SelectItem>
                <SelectItem key="PENDING">대기중</SelectItem>
                <SelectItem key="BUSINESS_OWNER">사업자</SelectItem>
                <SelectItem key="PART_TIME_WORKER">알바생</SelectItem>
              </Select>
              <Select
                placeholder="권한"
                aria-label="권한 필터"
                selectedKeys={selectedUserRole ? [selectedUserRole] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as UserRole | undefined;
                  setSelectedUserRole(key || "");
                }}
                className="w-48"
              >
                <SelectItem key="">모든 권한</SelectItem>
                <SelectItem key="USER">일반사용자</SelectItem>
                <SelectItem key="ADMIN">관리자</SelectItem>
                <SelectItem key="SUPER_ADMIN">최고관리자</SelectItem>
              </Select>
              {selectedUserType === "BUSINESS_OWNER" && (
                <Select
                  placeholder="인증 상태"
                  aria-label="인증 상태 필터"
                  selectedKeys={selectedVerificationStatus ? [selectedVerificationStatus] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as VerificationStatus | undefined;
                    setSelectedVerificationStatus(key || "");
                  }}
                  className="w-48"
                >
                  <SelectItem key="">모든 상태</SelectItem>
                  <SelectItem key="NOT_REQUESTED">미신청</SelectItem>
                  <SelectItem key="PENDING">대기중</SelectItem>
                  <SelectItem key="REVIEWING">검토중</SelectItem>
                  <SelectItem key="APPROVED">승인됨</SelectItem>
                  <SelectItem key="VERIFIED">인증완료</SelectItem>
                  <SelectItem key="REJECTED">거부됨</SelectItem>
                </Select>
              )}
            </div>
          </CardBody>
        </Card>

        {/* 사용자 테이블 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                사용자 목록 ({allUsers.length}명 표시 중)
              </h3>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading && allUsers.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                <Table aria-label="사용자 테이블">
                  <TableHeader>
                    <TableColumn>사용자 정보</TableColumn>
                    <TableColumn>유저 타입</TableColumn>
                    <TableColumn>권한</TableColumn>
                    <TableColumn>인증 상태</TableColumn>
                    <TableColumn>가입일</TableColumn>
                    <TableColumn>액션</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="사용자가 없습니다.">
                    {allUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <p className="font-medium">{user.nickname}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.phoneNumber && (
                              <p className="text-xs text-gray-400">{user.phoneNumber}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip color={getUserTypeColor(user.userType)} size="sm">
                            {formatUserType(user.userType)}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip color={getUserRoleColor(user.userRole)} size="sm">
                            {formatUserRole(user.userRole)}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          {user.userType === "BUSINESS_OWNER" && user.verificationStatus ? (
                            <Chip color={getVerificationStatusColor(user.verificationStatus)} size="sm">
                              {formatVerificationStatus(user.verificationStatus)}
                            </Chip>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light" aria-label="사용자 액션 메뉴">
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
                                onClick={() => handleEditUser(user)}
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

                {/* 무한 스크롤 로드 더 보기 */}
                {hasNextPage && (
                  <div className="flex justify-center p-4">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      variant="bordered"
                      startContent={
                        isFetchingNextPage ? (
                          <Spinner size="sm" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      }
                    >
                      {isFetchingNextPage ? "로딩 중..." : "더 보기"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* 사용자 상세보기 모달 */}
      <Modal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        size="3xl"
        // HeroUI 안정성 최적화 적용
        disableAnimation={true}
        hideCloseButton={false}
        isDismissable={true}
        isKeyboardDismissDisabled={false}
        motionProps={{
          variants: {
            enter: { opacity: 1, scale: 1, transition: { duration: 0 } },
            exit: { opacity: 1, scale: 1, transition: { duration: 0 } }
          }
        }}
        classNames={{
          wrapper: "z-[9999]",
          backdrop: "z-[9998] bg-black/50",
          base: "z-[9999] bg-white max-h-[90vh] overflow-hidden"
        }}
      >
        <ModalContent className="max-h-[90vh] overflow-hidden">
          <ModalHeader>사용자 상세 정보</ModalHeader>
          <ModalBody className="overflow-y-auto">
            {isDetailLoading ? (
              <div className="flex justify-center items-center h-32">
                <Spinner size="lg" />
              </div>
            ) : userDetail ? (
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">기본 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">닉네임</label>
                      <p className="mt-1 text-sm text-gray-900">{userDetail.user.nickname}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">이메일</label>
                      <p className="mt-1 text-sm text-gray-900">{userDetail.user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">전화번호</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userDetail.user.phoneNumber || "미등록"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">카카오 ID</label>
                      <p className="mt-1 text-sm text-gray-900">{userDetail.user.kakaoId}</p>
                    </div>
                  </div>
                </div>

                {/* 역할 및 타입 */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">역할 및 타입</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">유저 타입</label>
                      <div className="mt-1">
                        <Chip color={getUserTypeColor(userDetail.user.userType)} size="sm">
                          {formatUserType(userDetail.user.userType)}
                        </Chip>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">권한</label>
                      <div className="mt-1">
                        <Chip color={getUserRoleColor(userDetail.user.userRole)} size="sm">
                          {formatUserRole(userDetail.user.userRole)}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 사업자 정보 (사업자인 경우만) */}
                {userDetail.businessOwner && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">사업자 정보</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">사업자명</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {userDetail.businessOwner.businessName || "미등록"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">대표자명</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {userDetail.businessOwner.ownerName || "미등록"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">사업자등록번호</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {userDetail.businessOwner.businessRegistrationNumber || "미등록"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">인증 상태</label>
                        <div className="mt-1">
                          <Chip color={getVerificationStatusColor(userDetail.businessOwner.verificationStatus)} size="sm">
                            {formatVerificationStatus(userDetail.businessOwner.verificationStatus)}
                          </Chip>
                        </div>
                      </div>
                      {userDetail.businessOwner.businessAddress && (
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-700">사업장 주소</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {userDetail.businessOwner.businessAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 통계 정보 */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">활동 통계</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">소속 사업장</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userDetail.statistics.workplaceCount}개
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">출근 기록</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userDetail.statistics.attendanceCount}회
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">스케줄</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userDetail.statistics.scheduleCount}개
                      </p>
                    </div>
                  </div>
                </div>

                {/* 날짜 정보 */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">날짜 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">가입일</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(userDetail.user.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">최근 수정일</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(userDetail.user.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>사용자 정보를 불러올 수 없습니다.</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onClick={onDetailClose}>
              닫기
            </Button>
            {selectedUser && (
              <Button
                color="primary"
                startContent={<Edit className="w-4 h-4" />}
                onClick={() => {
                  onDetailClose();
                  handleEditUser(selectedUser);
                }}
              >
                수정
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 사용자 수정 모달 */}
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="2xl"
        // HeroUI 안정성 최적화 적용
        disableAnimation={true}
        hideCloseButton={false}
        isDismissable={true}
        isKeyboardDismissDisabled={false}
        motionProps={{
          variants: {
            enter: { opacity: 1, scale: 1, transition: { duration: 0 } },
            exit: { opacity: 1, scale: 1, transition: { duration: 0 } }
          }
        }}
        classNames={{
          wrapper: "z-[9999]",
          backdrop: "z-[9998] bg-black/50",
          base: "z-[9999] bg-white"
        }}
      >
        <ModalContent>
          <ModalHeader>사용자 정보 수정</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="닉네임"
                value={editFormData.nickname || ""}
                onChange={(e) => setEditFormData(prev => ({ ...prev, nickname: e.target.value }))}
              />
              <Input
                label="이메일"
                type="email"
                value={editFormData.email || ""}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                label="전화번호"
                value={editFormData.phoneNumber || ""}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
              <Select
                label="유저 타입"
                selectedKeys={editFormData.userType ? [editFormData.userType] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as UserType | undefined;
                  setEditFormData(prev => ({ ...prev, userType: key }));
                }}
                // HeroUI Select 안정성 최적화
                disableAnimation={true}
                aria-label="유저 타입 선택"
                classNames={{
                  trigger: "border-gray2 bg-white rounded-xl",
                  popoverContent: "rounded-xl border-gray2 shadow-lg"
                }}
              >
                <SelectItem key="PENDING">대기중</SelectItem>
                <SelectItem key="BUSINESS_OWNER">사업자</SelectItem>
                <SelectItem key="PART_TIME_WORKER">알바생</SelectItem>
              </Select>
              <Select
                label="권한"
                selectedKeys={editFormData.userRole ? [editFormData.userRole] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as UserRole | undefined;
                  setEditFormData(prev => ({ ...prev, userRole: key }));
                }}
                // HeroUI Select 안정성 최적화
                disableAnimation={true}
                aria-label="권한 선택"
                classNames={{
                  trigger: "border-gray2 bg-white rounded-xl",
                  popoverContent: "rounded-xl border-gray2 shadow-lg"
                }}
              >
                <SelectItem key="USER">일반사용자</SelectItem>
                <SelectItem key="ADMIN">관리자</SelectItem>
                <SelectItem key="SUPER_ADMIN">최고관리자</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onClick={onEditClose}>
              취소
            </Button>
            <Button
              color="primary"
              onClick={handleSubmitEdit}
              isLoading={updateUserMutation.isPending}
            >
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        // HeroUI 안정성 최적화 적용
        disableAnimation={true}
        hideCloseButton={false}
        isDismissable={true}
        isKeyboardDismissDisabled={false}
        motionProps={{
          variants: {
            enter: { opacity: 1, scale: 1, transition: { duration: 0 } },
            exit: { opacity: 1, scale: 1, transition: { duration: 0 } }
          }
        }}
        classNames={{
          wrapper: "z-[9999]",
          backdrop: "z-[9998] bg-black/50",
          base: "z-[9999] bg-white"
        }}
      >
        <ModalContent>
          <ModalHeader>사용자 삭제</ModalHeader>
          <ModalBody>
            <p>
              정말로 <strong>{selectedUser?.nickname}</strong> 사용자를
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
            <Button color="danger" onClick={onDeleteClose}>
              삭제
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
