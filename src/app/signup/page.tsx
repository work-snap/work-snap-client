"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { IoArrowBack } from "react-icons/io5";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUserTypeSelect = async (
    userType: "BUSINESS_OWNER" | "PART_TIME_WORKER"
  ) => {
    try {
      setIsLoading(true);

      const response = await api.post("/api/v1/users/select-type", { userType });
      
      // 서버에서 반환하는 실제 사용자 정보로 업데이트
      if (response.data && response.data.data) {
        const updatedUser = response.data.data;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("✅ 서버에서 반환된 사용자 정보로 업데이트:", updatedUser);
      } else {
        // 서버 응답이 없는 경우 기존 방식으로 업데이트
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.userType = userType;
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      console.log("✅ 사용자 타입 선택 완료:", userType);

      // 타입에 따른 환영 페이지로 이동
      if (userType === "BUSINESS_OWNER") {
        router.push("/signup/business/signup-1");
      } else {
        router.push("/signup/ptjob");
      }
    } catch (error) {
      console.error("❌ 사용자 타입 선택 실패:", error);
      alert("사용자 타입 선택에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    alert("로그아웃되었습니다.");
    router.push("/");
  };

  return (
    <div className="h-full flex flex-col bg-white max-w-[430px] w-full mx-auto">
      {/* 상단 뒤로가기 */}
      <div className="flex items-center justify-between py-4 px-2">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2">
            <IoArrowBack size={24} />
          </button>
        </div>
        {/* 임시 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          로그아웃
        </button>
      </div>
      {/* 본문 */}
      <div className="flex flex-col items-start px-4 pt-2 w-full">
        <div className="mb-1 w-full">
          <span className="text-4xl font-extrabold text-main">Work Snap</span>
          <span className="text-2xl font-extrabold text-gray5 ml-1">
            을 어떻게 이용할 예정이신가요?
          </span>
        </div>
        <div className="text-gray3 text-sm mb-10 mt-2 w-full">
          사용자 유형을 선택해 주세요.
        </div>
        {/* 선택 버튼 */}
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={() => handleUserTypeSelect("PART_TIME_WORKER")}
            disabled={isLoading}
            className="w-full bg-gray2 rounded-xl py-7 flex flex-col items-center justify-center hover:bg-gray3 transition-colors disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="60"
              viewBox="0 0 104.689 128.061"
            >
              <path
                id="emoji_people_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24"
                d="M192.015-751.939v-84.68a40.422,40.422,0,0,1-23.291-16.088A45.946,45.946,0,0,1,160-880h12.806a32.369,32.369,0,0,0,8.564,22.651q8.564,9.364,21.85,9.364h16.008a22.767,22.767,0,0,1,8.964,1.761,23.573,23.573,0,0,1,7.524,5.122l28.974,28.974-8.964,8.964-25.292-25.292v76.516H217.627v-38.418H204.821v38.418Zm19.209-102.448a12.332,12.332,0,0,1-9.044-3.762,12.332,12.332,0,0,1-3.762-9.044,12.331,12.331,0,0,1,3.762-9.044A12.331,12.331,0,0,1,211.224-880a12.331,12.331,0,0,1,9.044,3.762,12.331,12.331,0,0,1,3.762,9.044,12.331,12.331,0,0,1-3.762,9.044A12.332,12.332,0,0,1,211.224-854.388Z"
                transform="translate(-160 880)"
                fill="#fa6956"
              />
            </svg>

            <span className="mt-2 text-gray5 font-semibold">알바님</span>
          </button>
          <button
            onClick={() => handleUserTypeSelect("BUSINESS_OWNER")}
            disabled={isLoading}
            className="w-full bg-gray2 rounded-xl py-7 flex flex-col items-center justify-center hover:bg-gray3 transition-colors disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="60"
              viewBox="0 0 115.049 103.06"
            >
              <path
                id="storefront_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24"
                d="M188.177-793.909v45.518a11.027,11.027,0,0,1-3.364,8.087,11.027,11.027,0,0,1-8.087,3.364H96.568a11.027,11.027,0,0,1-8.087-3.364,11.027,11.027,0,0,1-3.364-8.087v-45.518a19.706,19.706,0,0,1-5.081-7.73,15.534,15.534,0,0,1-.072-10.306l6.012-19.467a12.65,12.65,0,0,1,4.079-6.155,10.336,10.336,0,0,1,6.8-2.433H176.44a10.246,10.246,0,0,1,6.728,2.362,13.321,13.321,0,0,1,4.151,6.227l6.012,19.467a15.1,15.1,0,0,1-.072,10.163A22.623,22.623,0,0,1,188.177-793.909Zm-38.934-6.012a6.9,6.9,0,0,0,5.869-2.648,7.816,7.816,0,0,0,1.575-5.94l-3.149-20.039H142.372v21.185a7.541,7.541,0,0,0,2,5.225A6.318,6.318,0,0,0,149.243-799.921Zm-25.765,0a7.017,7.017,0,0,0,5.368-2.219,7.4,7.4,0,0,0,2.076-5.225v-21.185H119.756l-3.149,20.039a7.259,7.259,0,0,0,1.5,6.012A6.577,6.577,0,0,0,123.478-799.921Zm-25.479,0a6.3,6.3,0,0,0,4.509-1.861,8,8,0,0,0,2.362-4.724l3.149-22.043H96.854l-5.726,19.181a7.875,7.875,0,0,0,.93,6.155A6.228,6.228,0,0,0,98-799.921Zm77.3,0a6.384,6.384,0,0,0,6.012-3.292,7.276,7.276,0,0,0,.859-6.155l-6.012-19.181H165.275l3.149,22.043a8,8,0,0,0,2.362,4.724A6.3,6.3,0,0,0,175.295-799.921Zm-78.727,51.53h80.158v-40.365a3.457,3.457,0,0,1-.93.286h-.5a16.782,16.782,0,0,1-6.8-1.288,19.327,19.327,0,0,1-5.8-4.151,18.884,18.884,0,0,1-5.869,4.008,17.4,17.4,0,0,1-7.014,1.431,18.268,18.268,0,0,1-7.229-1.431,18.65,18.65,0,0,1-5.94-4.008,17.457,17.457,0,0,1-5.654,4.008,16.9,16.9,0,0,1-6.942,1.431,19.011,19.011,0,0,1-7.515-1.431,18.65,18.65,0,0,1-5.94-4.008,18.817,18.817,0,0,1-5.94,4.223A17.243,17.243,0,0,1,98-788.47h-.644a1.452,1.452,0,0,1-.787-.286Zm80.158,0h0Z"
                transform="translate(-79.122 840)"
                fill="#fa6956"
              />
            </svg>

            <span className="mt-2 text-gray5 font-semibold">사장님</span>
          </button>
        </div>

        {isLoading && (
          <div className="w-full text-center mt-4">
            <span className="text-gray-500">처리 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}
