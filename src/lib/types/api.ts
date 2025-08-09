export interface ApiError {
  response?: {
    data?: {
      message?: string;
      code?: string;
      errors?: Array<{
        field?: string;
        message: string;
      }>;
    };
    status?: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  };
}
