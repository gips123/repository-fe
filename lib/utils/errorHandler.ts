export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    // Check if it's a network error
    if (error.message.includes('fetch') || error.message.includes('Network')) {
      return 'Network error. Please check your connection.';
    }
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as { message?: string | string[] };
    if (apiError.message) {
      if (Array.isArray(apiError.message)) {
        return apiError.message.join(', ');
      }
      return apiError.message;
    }
  }
  
  return 'An unexpected error occurred';
}


