import React from "react";

function Login() {
  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-md bg-white  rounded-none flex flex-col items-center px-8 py-12 ">
        <div className="w-full flex items-center mb-8">
          <button className="text-2xl">←</button>
        </div>
        <h1 className="font-bold text-2xl mb-8 w-full">로그인</h1>
        <div className="w-full flex flex-col gap-4 mb-6">
          <label className="text-base font-medium">아이디</label>
          <input
            type="text"
            placeholder="아이디 입력"
            className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff6f5a] bg-[#fafafa] text-base"
          />
          <label className="text-base font-medium mt-2">비밀번호</label>
          <input
            type="password"
            placeholder="영문, 숫자 조합 8자리 이상"
            className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff6f5a] bg-[#fafafa] text-base"
          />
        </div>
        <button className="w-full bg-[#ff6f5a] text-white py-3 rounded-md font-semibold text-lg mb-8 hover:bg-[#ff5a3c] transition">
          로그인
        </button>
        <div className="w-full flex justify-center text-sm text-gray-500 gap-2">
          <span>아이디 찾기</span>
          <span>|</span>
          <span>비밀번호 찾기</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
