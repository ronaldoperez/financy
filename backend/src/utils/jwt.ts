import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'development-secret'

export type JwtPayload = { id: string; email: string }

export const signJwt = (payload: JwtPayload, expiresIn: string | number = '1d') =>
  jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions)

export const verifyJwt = (token: string) => jwt.verify(token, secret) as JwtPayload
