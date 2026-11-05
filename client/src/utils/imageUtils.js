/**
 * Utility to resolve full image URLs from backend assets
 * @param {string} path - Image filename or relative path
 * @returns {string|null} - Absolute image URL or null
 */
export function getAssetUrl(path) {
  if (!path) return null;
  if (
    typeof path === 'string' &&
    (path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('blob:') ||
      path.startsWith('data:'))
  ) {
    return path;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const serverBase = apiBase.replace(/\/api\/v1\/?$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (cleanPath.startsWith('/assets/')) {
    return `${serverBase}${cleanPath}`;
  }

  return `${serverBase}/assets${cleanPath}`;
}

export default getAssetUrl;
