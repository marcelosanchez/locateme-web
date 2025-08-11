export class SessionExpiredError extends Error {
  constructor(message = 'Session expired') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}

export const isSessionExpiredError = (error: unknown): error is SessionExpiredError => {
  return error instanceof SessionExpiredError || (error as any)?.name === 'SessionExpiredError'
}