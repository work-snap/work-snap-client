"use client";

export function DesignSystemExample() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-text-neutral-default">디자인 시스템 색상 가이드</h2>

      {/* Fill Colors Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-text-neutral-default">Fill Colors</h3>

        {/* Brand Fill */}
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-text-neutral-secondary">Brand Fill</h4>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-fill-brand-default p-4 rounded-lg text-center min-w-[120px]">
              <div className="text-text-brand-default font-medium">Default</div>
              <div className="text-sm text-text-neutral-secondary">#E9F5F4</div>
            </div>
            <div className="bg-fill-brand-secondary p-4 rounded-lg text-center min-w-[120px]">
              <div className="text-white font-medium">Secondary</div>
              <div className="text-sm text-white/80">#2A9D8F</div>
            </div>
            <div className="bg-fill-brand-tertiary p-4 rounded-lg text-center min-w-[120px]">
              <div className="text-text-brand-default font-medium">Tertiary</div>
              <div className="text-sm text-text-neutral-secondary">#aad8d2</div>
            </div>
            <div className="bg-fill-brand-transparent p-4 rounded-lg text-center min-w-[120px]">
              <div className="text-text-brand-default font-medium">Transparent</div>
              <div className="text-sm text-text-neutral-secondary">60% opacity</div>
            </div>
          </div>
        </div>

        {/* Neutral Fill */}
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-text-neutral-secondary">Neutral Fill</h4>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-fill-neutral-white border border-line-neutral-default p-4 rounded-lg text-center min-w-[120px]">
              <div className="text-text-neutral-default font-medium">White</div>
              <div className="text-sm text-text-neutral-secondary">#ffffff</div>
            </div>
            <div className="bg-fill-neutral-default p-4 rounded-lg text-center min-w-[120px]">
              <div className="text-text-neutral-default font-medium">Default</div>
              <div className="text-sm text-text-neutral-secondary">#faf8f4</div>
            </div>
            <div className="bg-fill-neutral-secondary p-4 rounded-lg text-center min-w-[120px]">
              <div className="text-text-neutral-default font-medium">Secondary</div>
              <div className="text-sm text-text-neutral-secondary">#FAF8F4</div>
            </div>
          </div>
        </div>
      </section>

      {/* Button Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-text-neutral-default">Button Examples</h3>

        {/* Brand Buttons */}
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-text-neutral-secondary">Brand Buttons</h4>
          <div className="flex gap-4 flex-wrap">
            <button
              className="
              px-6 py-3 rounded-lg font-medium transition-all duration-200
              bg-button-fill-brand-default hover:bg-button-fill-brand-default-pressed
              text-button-text-neutral-white
              border border-button-line-brand-default
            "
            >
              Primary Button
            </button>

            <button
              className="
              px-6 py-3 rounded-lg font-medium transition-all duration-200
              bg-button-fill-brand-secondary hover:bg-button-fill-brand-secondary-pressed
              text-button-text-brand-default
              border border-button-line-brand-secondary
            "
            >
              Secondary Button
            </button>

            <button
              className="
              px-6 py-3 rounded-lg font-medium transition-all duration-200
              bg-transparent hover:bg-fill-brand-default
              text-button-text-brand-default hover:text-button-text-brand-secondary
              border border-button-line-brand-default
            "
            >
              Outline Button
            </button>
          </div>
        </div>

        {/* Neutral Buttons */}
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-text-neutral-secondary">Neutral Buttons</h4>
          <div className="flex gap-4 flex-wrap">
            <button
              className="
              px-6 py-3 rounded-lg font-medium transition-all duration-200
              bg-button-fill-neutral-default hover:bg-button-fill-neutral-default-pressed
              text-button-text-neutral-default
              border border-button-line-neutral-default
            "
            >
              Default Button
            </button>

            <button
              className="
              px-6 py-3 rounded-lg font-medium transition-all duration-200
              bg-button-fill-neutral-secondary hover:bg-button-fill-neutral-secondary-pressed
              text-button-text-neutral-secondary
              border border-button-line-neutral-secondary
            "
            >
              Secondary Button
            </button>

            <button
              className="
              px-6 py-3 rounded-lg font-medium
              bg-button-fill-disabled-default
              text-button-text-disabled-default
              border border-button-line-disabled-default
              cursor-not-allowed
            "
            >
              Disabled Button
            </button>
          </div>
        </div>
      </section>

      {/* Text Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-text-neutral-default">Text Examples</h3>

        <div className="space-y-3">
          <p className="text-text-brand-default text-lg font-semibold">Brand Primary Text (#2A9D8F)</p>
          <p className="text-text-brand-secondary text-lg">Brand Secondary Text (#7ec4bc)</p>
          <p className="text-text-neutral-default text-lg">Neutral Default Text (#252525)</p>
          <p className="text-text-neutral-secondary text-base">Neutral Secondary Text (#70706e)</p>
          <p className="text-text-neutral-tertiary text-base">Neutral Tertiary Text (#bbbab7)</p>
          <p className="text-text-etc-coral text-lg font-medium">Coral Accent Text (#F17E61)</p>
          <p className="text-text-disabled-default text-base">Disabled Text (#f0eeea)</p>
        </div>
      </section>

      {/* Icon Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-text-neutral-default">Icon Examples</h3>

        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-icon-fill-brand-default rounded"></div>
            <span className="text-text-neutral-secondary">Brand Default</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-icon-fill-brand-secondary rounded"></div>
            <span className="text-text-neutral-secondary">Brand Secondary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-icon-fill-neutral-default rounded"></div>
            <span className="text-text-neutral-secondary">Neutral Default</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-icon-fill-disabled-default rounded"></div>
            <span className="text-text-neutral-secondary">Disabled</span>
          </div>
        </div>
      </section>

      {/* Line/Border Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-text-neutral-default">Border Examples</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-fill-neutral-white border-2 border-line-brand-default rounded-lg">
            <p className="text-text-neutral-default">Brand Default Border</p>
          </div>
          <div className="p-4 bg-fill-neutral-white border-2 border-line-brand-secondary rounded-lg">
            <p className="text-text-neutral-default">Brand Secondary Border</p>
          </div>
          <div className="p-4 bg-fill-neutral-white border-2 border-line-neutral-default rounded-lg">
            <p className="text-text-neutral-default">Neutral Default Border</p>
          </div>
          <div className="p-4 bg-fill-neutral-white border-2 border-line-alert-default rounded-lg">
            <p className="text-text-neutral-default">Alert Border</p>
          </div>
        </div>
      </section>

      {/* Cards with Design System */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-text-neutral-default">Card Examples</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-fill-neutral-white border border-line-neutral-secondary rounded-lg p-6">
            <h4 className="text-text-neutral-default font-semibold mb-2">기본 카드</h4>
            <p className="text-text-neutral-secondary mb-4">기본적인 카드 레이아웃입니다.</p>
            <button
              className="
              px-4 py-2 rounded-lg
              bg-button-fill-brand-default hover:bg-button-fill-brand-default-pressed
              text-button-text-neutral-white
              transition-colors duration-200
            "
            >
              자세히 보기
            </button>
          </div>

          <div className="bg-fill-brand-default border border-line-brand-secondary rounded-lg p-6">
            <h4 className="text-text-brand-default font-semibold mb-2">브랜드 카드</h4>
            <p className="text-text-neutral-secondary mb-4">브랜드 색상을 활용한 카드입니다.</p>
            <button
              className="
              px-4 py-2 rounded-lg
              bg-button-fill-brand-secondary hover:bg-button-fill-brand-secondary-pressed
              text-button-text-brand-default
              transition-colors duration-200
            "
            >
              액션
            </button>
          </div>

          <div className="bg-fill-neutral-secondary border border-line-neutral-default rounded-lg p-6">
            <h4 className="text-text-neutral-default font-semibold mb-2">중성 카드</h4>
            <p className="text-text-neutral-secondary mb-4">중성 톤의 차분한 카드입니다.</p>
            <button
              className="
              px-4 py-2 rounded-lg
              bg-button-fill-neutral-default hover:bg-button-fill-neutral-default-pressed
              text-button-text-neutral-default
              transition-colors duration-200
            "
            >
              확인
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
