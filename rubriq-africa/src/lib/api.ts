export const BACKEND_URL = "http://localhost:5000";

/**
 * Normalizes image paths returned by the backend, ensuring they are resolved
 * correctly against the backend URL, or falls back to a high-quality placeholder.
 */
export function getImageUrl(path: string | undefined | null): string {
  if (!path) {
    return "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400";
  }
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
}
