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
      onTestResult(createTestResult("/api/v1/users/profile", "GET", response));
    } catch (error) {
      onTestResult(
        createTestResult("/api/v1/users/profile", "GET", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const handleGetUserInfo = async () => {
    onLoadingChange("my-info");
    try {
      const response = await testApis.user.getUserInfo();
      onTestResult(createTestResult("/api/v1/users/info", "GET", response));
    } catch (error) {
      onTestResult(createTestResult("/api/v1/users/info", "GET", null, error));
    } finally {
      onLoadingChange(null);
    }
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoadingChange("update-info");
    try {
      const response = await testApis.user.updateMyInfo(userUpdateForm);
      onTestResult(createTestResult("/api/v1/users/profile", "PUT", response));
      setShowUserUpdateForm(false);
      resetForm();
    } catch (error) {
      onTestResult(
        createTestResult("/api/v1/users/profile", "PUT", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const handleUpdateUserInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoadingChange("update-info");
    try {
      const response = await testApis.user.updateUserInfo(userUpdateForm);
      onTestResult(createTestResult("/api/v1/users/info", "PUT", response));
      setShowUserUpdateForm(false);
      resetForm();
    } catch (error) {
      onTestResult(createTestResult("/api/v1/users/info", "PUT", null, error));
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
        createTestResult("/api/v1/users/select-type", "POST", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult("/api/v1/users/select-type", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 사용자 정보 조회 */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-50/80 to-green-50/80 border border-emerald-200/50 rounded-2xl p-6 shadow-xl shadow-emerald-500/10 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-green-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">👤</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                사용자 정보 관리
              </h4>
              <p className="text-emerald-600/80 mt-1">
                내 정보를 조회하고 수정할 수 있습니다
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={handleGetMyInfo}
              disabled={loading === "my-info"}
              className="group relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "my-info" ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>조회 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>📋</span>
                  <span>프로필 조회</span>
                </span>
              )}
            </button>

            <button
              onClick={handleGetUserInfo}
              disabled={loading === "my-info"}
              className="group relative bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "my-info" ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>조회 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>👤</span>
                  <span>사용자 정보</span>
                </span>
              )}
            </button>

            <button
              onClick={() => setShowUserUpdateForm(!showUserUpdateForm)}
              className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                showUserUpdateForm
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25"
                  : "backdrop-blur-sm bg-white/70 hover:bg-white/90 text-emerald-700 border border-emerald-200/50 hover:border-emerald-300/50"
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{showUserUpdateForm ? "📝" : "✏️"}</span>
                <span>{showUserUpdateForm ? "폼 닫기" : "정보 수정"}</span>
              </span>
            </button>
          </div>

          {showUserUpdateForm && (
            <div className="mt-6 backdrop-blur-sm bg-white/70 rounded-2xl p-6 border border-emerald-100/50 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={handleUserUpdate} className="space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📋</span>
                    </div>
                    <h5 className="text-lg font-bold text-emerald-700">
                      프로필 수정 (/profile)
                    </h5>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      닉네임
                    </label>
                    <input
                      type="text"
                      placeholder="새로운 닉네임을 입력하세요"
                      value={userUpdateForm.nickname}
                      onChange={(e) => updateForm({ nickname: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 bg-white/80 border border-emerald-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      사용자 타입
                    </label>
                    <select
                      value={userUpdateForm.userType}
                      onChange={(e) => updateForm({ userType: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 bg-white/80 border border-emerald-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
                    >
                      {USER_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading === "update-info"}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {loading === "update-info" ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>수정 중...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <span>💾</span>
                        <span>프로필 수정</span>
                      </span>
                    )}
                  </button>
                </form>

                <form onSubmit={handleUpdateUserInfo} className="space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">👤</span>
                    </div>
                    <h5 className="text-lg font-bold text-teal-700">
                      사용자 정보 수정 (/info)
                    </h5>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      닉네임
                    </label>
                    <input
                      type="text"
                      placeholder="새로운 닉네임을 입력하세요"
                      value={userUpdateForm.nickname}
                      onChange={(e) => updateForm({ nickname: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 bg-white/80 border border-teal-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      사용자 타입
                    </label>
                    <select
                      value={userUpdateForm.userType}
                      onChange={(e) => updateForm({ userType: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 bg-white/80 border border-teal-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
                    >
                      {USER_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading === "update-info"}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {loading === "update-info" ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>수정 중...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <span>💾</span>
                        <span>정보 수정</span>
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 사용자 타입 선택 */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-teal-50/80 to-cyan-50/80 border border-teal-200/50 rounded-2xl p-6 shadow-xl shadow-teal-500/10 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-cyan-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🔄</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
                사용자 타입 변경
              </h4>
              <p className="text-teal-600/80 mt-1">
                계정의 사용자 타입을 변경할 수 있습니다
              </p>
            </div>
          </div>

          <form onSubmit={handleUserTypeSelect} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">👥</span>
                </div>
                <label className="text-sm font-semibold text-gray-800">
                  사용자 타입
                </label>
              </div>
              <select
                value={userUpdateForm.userType}
                onChange={(e) => updateForm({ userType: e.target.value })}
                className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-teal-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
              >
                {USER_TYPE_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="font-medium"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading === "select-type"}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "select-type" ? (
                <span className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>변경 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-3">
                  <span>🔄</span>
                  <span>사용자 타입 변경</span>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
