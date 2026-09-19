export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.status = status
  }
}

export async function request(path, options = {}) {
  const { base = '/data', ...fetchOptions } = options
  let response
  try {
    response = await fetch(`${base}${path}`, {
      ...fetchOptions,
      headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
      signal: fetchOptions.signal ?? AbortSignal.timeout(15000),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('We could not reach the library. Please try again.')
  }
  if (!response.ok) {
    const messages = {
      404: 'This item could not be found.',
      409: 'This item already exists.',
      429: 'Too many requests. Please wait a moment.',
    }
    throw new ApiError(
      messages[response.status] || 'Something went wrong. Please try again.',
      response.status,
    )
  }
  if (response.status === 204) return null
  return response.json()
}
