import { AUTH_CONFIG } from '@/app/form/authConfig'
import { toast } from 'react-toastify'

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const options: RequestInit = { credentials: 'include', ...init }

  try {
    const response = await fetch(input, options)
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`
      if (response.status === 401) {
        message = AUTH_CONFIG.errors.unauthorized
      } else if (response.status === 501 || response.status >= 500) {
        message = 'Server error. Please try again later.'
      }
      toast.error(message)
    }
    return response
  } catch (error) {
    toast.error('Server error. Please try again later.')
    throw error
  }
}
