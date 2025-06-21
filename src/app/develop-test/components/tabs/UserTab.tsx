import React, { useState } from "react";
import { LoadingState } from "../../lib/types";
import { testApis } from "../../lib/api";
import { createTestResult, USER_TYPE_OPTIONS } from "../../lib/utils";
import { useUserUpdateForm } from "../../lib/hooks";

interface UserTabProps {
  loading: LoadingState;
  onLoadingChange: (state: LoadingState) => void;
  onTestResult: (result: any) => void;
}

export const UserTab: React.FC<UserTabProps> = ({
  loading,
  onLoadingChange,
  onTestResult,
}) => {
  const [showUserUpdateForm, setShowUserUpdateForm] = useState(false);
  const { form: userUpdateForm, updateForm, resetForm } = useUserUpdateForm();

  const handleGetMyInfo = async () => {
    onLoadingChange("my-info");
    try {
      const response = await testApis.user.getMyInfo();
      onTestResult(createTestResult("/api/users/me", "GET", response));
    } catch (error) {
      onTestResult(createTestResult("/api/users/me", "GET", null, error));
    } finally {
      onLoadingChange(null);
    }
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoadingChange("update-info");
    try {
      const response = await testApis.user.updateMyInfo(userUpdateForm);
      onTestResult(createTestResult("/api/users/me", "PUT", response));
      setShowUserUpdateForm(false);
      resetForm();
    } catch (error) {
      onTestResult(createTestResult("/api/users/me", "PUT", null, error));
    } finally {
      onLoadingChange(null);
    }
  };

  const handleUserTypeSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoadingChange("select-type");
    try {
      const response = await testApis.user.selectUserType(
        userUpdateForm.userType
      );
      onTestResult(
        createTestResult("/api/users/me/select-type", "POST", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult("/api/users/me/select-type", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 사용자 정보 조회 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-green-800 mb-4">
          👤 사용자 정보
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={handleGetMyInfo}
            disabled={loading === "my-info"}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "my-info" ? "조회 중..." : "내 정보 조회"}
          </button>
          <button
            onClick={() => setShowUserUpdateForm(!showUserUpdateForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            내 정보 수정 폼 {showUserUpdateForm ? "닫기" : "열기"}
          </button>
        </div>

        {showUserUpdateForm && (
          <form
            onSubmit={handleUserUpdate}
            className="mt-4 p-4 bg-white rounded border space-y-3"
          >
            <h5 className="font-medium text-green-700">사용자 정보 수정</h5>
            <input
              type="text"
              placeholder="닉네임"
              value={userUpdateForm.nickname}
              onChange={(e) => updateForm({ nickname: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <select
              value={userUpdateForm.userType}
              onChange={(e) => updateForm({ userType: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {USER_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading === "update-info"}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              {loading === "update-info" ? "수정 중..." : "정보 수정"}
            </button>
          </form>
        )}
      </div>

      {/* 사용자 타입 선택 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-green-800 mb-4">
          🔧 사용자 타입 선택
        </h4>
        <form onSubmit={handleUserTypeSelect} className="space-y-3">
          <select
            value={userUpdateForm.userType}
            onChange={(e) => updateForm({ userType: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {USER_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading === "select-type"}
            className="bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "select-type" ? "선택 중..." : "사용자 타입 선택"}
          </button>
        </form>
      </div>
    </div>
  );
};
