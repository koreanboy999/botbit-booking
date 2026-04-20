import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'botbit_fallback_secret_key_2026'
  return new TextEncoder().encode(secret)
}

export interface SessionPayload {
  id: string
  username: string
  role: string
  displayName: string
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(getJwtSecretKey())
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession() {
  const token = cookies().get('session')?.value
  if (!token) return null
  return await verifyToken(token)
}
