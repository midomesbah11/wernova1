/**
 * Utility to optimize Cloudinary image URLs.
 * 
 * - Ensures Cloudinary's dynamic format (f_auto) and quality (q_auto) optimization is applied.
 * - Converts HEIC/HEIF extensions to JPG to ensure high browser compatibility while allowing
 *   Cloudinary to serve modern formats (WebP/AVIF) on the fly.
 * 
 * @param {string} url - The original image URL.
 * @returns {string} The optimized image URL.
 */
export function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return url;

  // Check if it's a Cloudinary URL
  if (url.includes('cloudinary.com')) {
    let optimizedUrl = url;

    // 1. Ensure f_auto,q_auto is present in the transformation path
    if (optimizedUrl.includes('/upload/')) {
      if (!optimizedUrl.includes('/f_auto,q_auto/')) {
        optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
      }
    }

    // 2. Convert HEIC/HEIF extensions to .jpg
    // Cloudinary will fetch the original HEIC asset, convert it to JPG (or WebP/AVIF via f_auto),
    // and deliver it with high compatibility.
    optimizedUrl = optimizedUrl.replace(/\.(heic|heif)$/i, '.jpg');

    return optimizedUrl;
  }

  return url;
}
