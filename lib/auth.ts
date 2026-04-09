import bcrypt from 'bcryptjs'
import { jwtVerify, SignJWT } from 'jose'

const jwtSecretValue = process.env.JWT_SECRET
if (!jwtSecretValue) {
  throw new Error('Missing JWT_SECRET environment variable')
}

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(jwtSecretValue)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

export async function verifyToken(token: string) {
  return jwtVerify(token, getJwtSecret())
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function sanitizeString(str: string): string {
  return str.trim().substring(0, 1000)
}
