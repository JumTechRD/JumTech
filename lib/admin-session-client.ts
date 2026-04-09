import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export async function ensureAdminSession(router: AppRouterInstance): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/me', { cache: 'no-store' })
    if (!response.ok) {
      router.push('/admin/login')
      return false
    }
    return true
  } catch {
    router.push('/admin/login')
    return false
  }
}

export async function logoutAdminSession(router: AppRouterInstance) {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } finally {
    router.push('/admin/login')
  }
}
