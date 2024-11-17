import { User } from "./user.model";

export interface JwtPayload extends User {
  authorities: string[];
  expiresIn: number;
  userId: string;
  iat: number;
  exp: number;
}

export interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
  message: string;
}
