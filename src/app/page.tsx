import AuthCheckOverlay from "./components/AuthCheckOverlay";
import KakaoLoginButton from "./components/KakaoLoginButton";

/**
 * 메인 랜딩 페이지 (SSR 최적화)
 * - 정적 UI는 즉시 렌더링 (FCP/LCP 최적화)
 * - 인증 체크는 클라이언트에서 백그라운드 실행
 */
export default function Home() {
  return (
    <>
      {/* 백그라운드 인증 체크 (클라이언트 컴포넌트) */}
      <AuthCheckOverlay />

      {/* 정적 UI (SSR 렌더링) */}
      <div className="h-dvh flex flex-col items-center justify-between bg-white max-w-[430px] w-full mx-auto">
        {/* 중앙 컨텐츠 */}
        <div className="flex flex-col items-center justify-center flex-1">
          {/* 로고 */}
          <div className="">
            <svg
              id="그룹_25"
              data-name="그룹 25"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="160"
              height="170"
              viewBox="0 0 408.601 324.72"
            >
              <defs>
                <clipPath id="clip-path">
                  <rect
                    id="사각형_104"
                    data-name="사각형 104"
                    width="408.601"
                    height="324.72"
                    fill="none"
                  />
                </clipPath>
              </defs>
              <g id="그룹_24" data-name="그룹 24" clipPath="url(#clip-path)">
                <path
                  id="패스_214"
                  data-name="패스 214"
                  d="M218.494,2.13H192.237c-16.2,0-32.022,13.008-35.151,28.908l-25.249,128.3c-3.129,15.9-7.849,15.824-10.489-.162L99.859,29.067C97.219,13.081,81.8,0,65.6,0H23.154C6.95,0-3.085,12.86.857,28.578l61.909,246.94a34.949,34.949,0,0,0,6.252,12.625l130.67-130.67c1.78-6.016,3.939-8.008,5.978-5.981l59.726-59.723L253.58,31.05C250.487,15.144,234.7,2.13,218.494,2.13"
                  transform="translate(0)"
                  fill="#050825"
                />
                <path
                  id="패스_215"
                  data-name="패스 215"
                  d="M142.12,0c-16.2,0-31.651,13.075-34.326,29.059l-3.479,20.768L154.143,0Z"
                  transform="translate(203.017)"
                  fill="#050825"
                />
                <path
                  id="패스_216"
                  data-name="패스 216"
                  d="M53.8,207.073H95.816c16.2,0,32-13.013,35.1-28.917l21.94-112.528q.579-2.957,1.237-5.179L23.425,191.119c7.195,9.422,18.844,15.954,30.375,15.954"
                  transform="translate(45.59 117.647)"
                  fill="#f02e2f"
                />
                <path
                  id="패스_217"
                  data-name="패스 217"
                  d="M249.586,7H221.3L171.473,56.826,153.159,166.193c-2.675,15.98-7.4,16.042-10.489.136l-13.14-67.56L69.808,158.491c1.511,1.505,2.955,5.218,4.128,11.148L96.165,282.191c3.138,15.9,18.965,28.905,35.169,28.905H173.35c16.2,0,32.685-12.86,36.627-28.578l61.906-246.94C275.825,19.86,265.79,7,249.586,7"
                  transform="translate(135.861 13.623)"
                  fill="#fa6956"
                />
              </g>
            </svg>
          </div>
          {/* 앱명 */}
          <h1 className="text-main text-3xl font-extrabold mb-2 tracking-tight">
            Work Snap
          </h1>
          {/* 설명 */}
          <div className="text-main2 text-lg font-extrabold">
            편리한 알바 출석 관리
          </div>
        </div>

        {/* 하단 카카오 버튼 */}
        <div className="w-full flex flex-col items-center gap-4 justify-center pb-8">
          <KakaoLoginButton />
        </div>
      </div>
    </>
  );
}
