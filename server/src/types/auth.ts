export type AuthUser = {
  id: string
  username: string
  email: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type RegisterRequest = {
  username: string
  email: string
  password: string
}

export type AuthResponse = {
  user: AuthUser
  token: string
}

export type JwtPayload = {
  userId: string
  username: string
  email: string
  iat?: number
  exp?: number
}
