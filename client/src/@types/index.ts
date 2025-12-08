export interface RootState {
  auth: {
    user: User | null;
  };
}

export interface BusinessLogo {
  public_id: string;
  url: string;
  _id: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  BusinessLogo?: BusinessLogo;
  role: string;
  isActive?: boolean;
}

export interface ServerError {
  status?: number;
  data?: {
    message?: string;
  };
  message?: string;
}