// Order items sometimes come back double-encoded from the API
// (a JSON string inside a JSON string). Parse until we get an array.
export function parseItems(raw) {
  let items = raw;
  if (typeof items === 'string') items = JSON.parse(items);
  if (typeof items === 'string') items = JSON.parse(items);
  return Array.isArray(items) ? items : [];
}

// Same, but swallows parse errors and returns [] instead of throwing.
export function safeParseItems(raw) {
  try {
    return parseItems(raw);
  } catch {
    return [];
  }
}
