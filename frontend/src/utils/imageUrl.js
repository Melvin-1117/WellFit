/**
 * Resolves a product image path to a full URL.
 * Uploaded images (starting with /uploads/) need the backend API_URL prefix.
 * External URLs (https://) and local public paths (/products/) pass through unchanged.
 */
import { API_URL } from "./apiConfig";

export function resolveImageUrl(imagePath) {
  if (!imagePath) {
    return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80";
  }

  // Already a full URL or Base64 Data URL
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  // Uploaded to backend /uploads/ directory
  if (imagePath.startsWith("/uploads")) {
    return `${API_URL}${imagePath}`;
  }

  // Local public asset (e.g. /products/men/item1.jpg)
  return imagePath;
}
