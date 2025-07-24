export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
}

// Error Handling
export interface ApiErrorData {
  message: string;
  status: number;
  errors: string[];
  timestamp: string;
}

export class ApiError extends Error {
  public status: number;
  public errors: string[];
  public timestamp: string;

  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}
