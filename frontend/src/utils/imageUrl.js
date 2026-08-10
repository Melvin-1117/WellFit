/**
 * Resolves a product image path to a full URL.
 * Uploaded images (starting with /uploads/) need the backend API_URL prefix.
 * External URLs (https://) and local public paths (/products/) pass through unchanged.
 */
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5000");

export function resolveImageUrl(imagePath) {
  if (!imagePath) return "https://via.placeholder.com/300x400?text=WellFit";

  // Already a full URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Uploaded to backend /uploads/ directory
  if (imagePath.startsWith("/uploads")) {
    return `${API_URL}${imagePath}`;
  }

  // Local public asset (e.g. /products/men/item1.jpg)
  return imagePath;
}
