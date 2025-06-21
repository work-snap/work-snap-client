import React from "react";
import { AuthTokens } from "../lib/types";

interface AuthStatusDisplayProps {
  authTokens: AuthTokens;
}

export const AuthStatusDisplay: React.FC<AuthStatusDisplayProps> = ({
  authTokens,
}) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-2">🔐 현재 인증 상태</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="font-medium">Access Token:</span>
          <span
            className={`ml-2 ${
              authTokens.accessToken ? "text-green-600" : "text-red-600"
            }`}
          >
            {authTokens.accessToken ? "✅ 있음" : "❌ 없음"}
          </span>
        </div>
        <div>
          <span className="font-medium">User ID:</span>
          <span className="ml-2 text-gray-600">
            {authTokens.userId || "미설정"}
          </span>
        </div>
      </div>
    </div>
  );
};
