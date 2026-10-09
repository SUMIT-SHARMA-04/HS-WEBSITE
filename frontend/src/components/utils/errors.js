// The backend normalizes every error to {"error": ...} (see its
// exceptions.py), but the value itself varies: a plain string for
// manually-raised errors, or a nested object like
// {"guests": ["Not enough capacity for this time slot."]} for serializer
// validation errors. This flattens either shape into one readable string.
export function extractErrorMessage(data, fallback = 'Something went wrong. Please try again.') {
  const err = data?.error;
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (Array.isArray(err)) return err.join(' ') || fallback;
  if (typeof err === 'object') {
    const messages = Object.values(err).flat();
    return messages.length ? messages.join(' ') : fallback;
  }
  return fallback;
}
