"use client";

import React, { useState } from "react";

// Field types
export type FieldType = "text" | "email" | "password" | "number" | "tel" | "url" | "textarea" | "select" | "checkbox" | "radio" | "date" | "time" | "datetime-local" | "file";

// Validation rule types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any) => string | null;
}

// Field option for select/radio
export interface FieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Field configuration
export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  options?: FieldOption[]; // for select, radio
  validation?: ValidationRule;
  disabled?: boolean;
  defaultValue?: any;
}

// Field props
export interface TestFormFieldProps {
  config: FieldConfig;
  value?: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  className?: string;
}

/**
 * TestFormField - 재사용 가능한 폼 필드 컴포넌트
 * 
 * Features:
 * - 다양한 입력 타입 지원
 * - 실시간 유효성 검사
 * - 커스터마이징 가능한 스타일
 * - 접근성 고려
 * - 에러 메시지 표시
 */
export const TestFormField: React.FC<TestFormFieldProps> = ({
  config,
  value = "",
  onChange,
  error,
  className = "",
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    name,
    label,
    type,
    placeholder,
    description,
    options,
    validation,
    disabled = false,
  } = config;

  // 유효성 검사
  const validateValue = (value: any): string | null => {
    if (!validation) return null;

    const { required, minLength, maxLength, min, max, pattern, custom } = validation;

    // Required 검사
    if (required && (!value || (typeof value === "string" && value.trim() === ""))) {
      return `${label}은(는) 필수 항목입니다.`;
    }

    // 값이 없으면 더 이상 검사하지 않음
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return null;
    }

    // 문자열 길이 검사
    if (typeof value === "string") {
      if (minLength && value.length < minLength) {
        return `${label}은(는) 최소 ${minLength}자 이상이어야 합니다.`;
      }
      if (maxLength && value.length > maxLength) {
        return `${label}은(는) 최대 ${maxLength}자까지 가능합니다.`;
      }
    }

    // 숫자 범위 검사
    if (typeof value === "number") {
      if (min !== undefined && value < min) {
        return `${label}은(는) ${min} 이상이어야 합니다.`;
      }
      if (max !== undefined && value > max) {
        return `${label}은(는) ${max} 이하여야 합니다.`;
      }
    }

    // 패턴 검사
    if (pattern && typeof value === "string") {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return `${label}의 형식이 올바르지 않습니다.`;
      }
    }

    // 커스텀 검사
    if (custom) {
      return custom(value);
    }

    return null;
  };

  // 값 변경 처리
  const handleChange = (newValue: any) => {
    onChange(name, newValue);
    
    // 실시간 유효성 검사
    if (isTouched) {
      const validationError = validateValue(newValue);
      setLocalError(validationError);
    }
  };

  // Blur 처리
  const handleBlur = () => {
    setIsTouched(true);
    const validationError = validateValue(value);
    setLocalError(validationError);
  };

  // 에러 메시지 결정
  const displayError = error || localError;

  // 기본 input 스타일
  const getInputClassName = () => {
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors";
    const errorClass = displayError 
      ? "border-red-300 focus:ring-red-200 focus:border-red-400" 
      : "border-gray-300 focus:ring-blue-200 focus:border-blue-400";
    const disabledClass = disabled ? "bg-gray-100 cursor-not-allowed" : "";
    
    return `${baseClass} ${errorClass} ${disabledClass}`;
  };

  // 입력 요소 렌더링
  const renderInput = () => {
    const commonProps = {
      id: name,
      name,
      disabled,
      onBlur: handleBlur,
      className: getInputClassName(),
    };

    switch (type) {
      case "textarea":
        return (
          <textarea
            {...commonProps}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
          />
        );

      case "select":
        return (
          <select
            {...commonProps}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="">{placeholder || "선택하세요"}</option>
            {options?.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name={name}
              checked={Boolean(value)}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-200"
            />
            <span className="text-sm">{label}</span>
          </label>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(e.target.value)}
                  disabled={disabled || option.disabled}
                  className="border-gray-300 text-blue-600 focus:ring-blue-200"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case "file":
        return (
          <input
            {...commonProps}
            type="file"
            onChange={(e) => handleChange(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
            value={value}
            onChange={(e) => {
              const newValue = type === "number" ? Number(e.target.value) : e.target.value;
              handleChange(newValue);
            }}
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {type !== "checkbox" && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      {renderInput()}

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      {/* Error Message */}
      {displayError && (
        <p className="text-sm text-red-600" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
};

// Helper function to create field configs
export const createFieldConfig = (
  name: string,
  label: string,
  type: FieldType,
  options: Partial<Omit<FieldConfig, "name" | "label" | "type">> = {}
): FieldConfig => ({
  name,
  label,
  type,
  ...options,
});

// Common field presets
export const FieldPresets = {
  text: (name: string, label: string, required = false) =>
    createFieldConfig(name, label, "text", {
      validation: { required },
    }),

  email: (name: string, label = "이메일", required = false) =>
    createFieldConfig(name, label, "email", {
      validation: { 
        required,
        pattern: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
      },
    }),

  password: (name: string, label = "비밀번호", required = false) =>
    createFieldConfig(name, label, "password", {
      validation: { required, minLength: 6 },
    }),

  number: (name: string, label: string, min?: number, max?: number, required = false) =>
    createFieldConfig(name, label, "number", {
      validation: { required, min, max },
    }),

  textarea: (name: string, label: string, required = false) =>
    createFieldConfig(name, label, "textarea", {
      validation: { required },
    }),

  select: (name: string, label: string, options: FieldOption[], required = false) =>
    createFieldConfig(name, label, "select", {
      options,
      validation: { required },
    }),

  checkbox: (name: string, label: string) =>
    createFieldConfig(name, label, "checkbox"),

  radio: (name: string, label: string, options: FieldOption[], required = false) =>
    createFieldConfig(name, label, "radio", {
      options,
      validation: { required },
    }),
};