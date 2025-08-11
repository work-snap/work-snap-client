"use client";

import React from "react";

interface DevTokenFormProps {
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  buttonText: string;
  icon: string;
  buttonColor: string;
}

export const DevTokenForm: React.FC<DevTokenFormProps> = ({
  title,
  placeholder,
  value,
  onChange,
  onSubmit,
  loading,
  buttonText,
  icon,
  buttonColor,
}) => {
  return (
    <div className="backdrop-blur-sm bg-white/70 rounded-2xl p-6 border border-purple-100/50 shadow-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-8 h-8 ${buttonColor} rounded-lg flex items-center justify-center`}>
          <span className="text-white text-sm">{icon}</span>
        </div>
        <h5 className="text-lg font-bold text-purple-700">{title}</h5>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {title.includes("닉네임") ? "닉네임" : "사용자 ID"}
          </label>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 text-gray-900 bg-white/80 border border-purple-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${buttonColor} hover:opacity-90 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed`}
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>생성 중...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <span>{icon}</span>
              <span>{buttonText}</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
};