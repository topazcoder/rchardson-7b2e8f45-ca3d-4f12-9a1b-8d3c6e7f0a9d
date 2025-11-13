export type UserDto = {
  id: string;
  username: string;
  email: string;
  role: string;
  organizationId: string;
};

/** Credentials sent from client to server when logging in */
export type LoginDto = {
  email: string;
  password: string;
};

/** Shape of the JWT payload used across frontend/backend */
export type JwtPayload = {
  id: string;
  username: string;
  role: string;
  organizationId?: string;
};

/** Standard login response that contains an access token */
export type AccessTokenResponse = {
  accessToken: string;
};
