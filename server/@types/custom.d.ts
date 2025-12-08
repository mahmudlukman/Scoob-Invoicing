import { IUser } from "../models/user/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null;
    }
  }
}
