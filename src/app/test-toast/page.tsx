"use client";

import toast from "react-hot-toast";

export default function TestToastPage() {
  const showSuccessToast = () => {
    toast.success("출근 처리되었습니다.", {
      duration: 3000,
      position: 'bottom-center',
      style: {
        background: '#F0FDF4',
        color: '#166534',
        border: '1px solid #BBF7D0',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        padding: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      icon: '✅',
    });
  };

  const showErrorToast = () => {
    toast.error("오늘 날짜가 아닌 스케줄에는 출근할 수 없습니다.\n오늘 날짜의 스케줄을 확인해주세요.", {
      duration: 6000,
      position: 'bottom-center',
      style: {
        background: '#FEF2F2',
        color: '#DC2626',
        border: '1px solid #FECACA',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        padding: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      icon: '⚠️',
    });
  };

  const showWarningToast = () => {
    toast.error("이미 출근 처리된 스케줄입니다.", {
      duration: 5000,
      position: 'bottom-center',
      style: {
        background: '#FEF7CD',
        color: '#A16207',
        border: '1px solid #FDE68A',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        padding: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      icon: '⚠️',
    });
  };

  const showAuthErrorToast = () => {
    toast.error("해당 스케줄에 대한 권한이 없습니다.", {
      duration: 5000,
      position: 'bottom-center',
      style: {
        background: '#FEF2F2',
        color: '#DC2626',
        border: '1px solid #FECACA',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        padding: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      icon: '🔒',
    });
  };

  return (
    <div className="h-full bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          토스트 테스트
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={showSuccessToast}
            className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            ✅ 성공 토스트 (출근 완료)
          </button>
          
          <button
            onClick={showErrorToast}
            className="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            ⚠️ 에러 토스트 (날짜 불일치)
          </button>
          
          <button
            onClick={showWarningToast}
            className="w-full py-3 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            ⚠️ 경고 토스트 (중복 출근)
          </button>
          
          <button
            onClick={showAuthErrorToast}
            className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            🔒 권한 에러 토스트
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/attendance"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            ← 출석 페이지로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}