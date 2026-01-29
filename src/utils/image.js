/**
 * Resolves the image path based on environment.
 * In Production: Replaces .png with .webp for optimized assets.
 * In Development: Returns original path (serving local .png).
 * 
 * @param {string} path - The original image path (e.g., "/sliders/topic/01.png")
 * @returns {string} - The resolved path
 */
export const getImagePath = (path) => {
    if (!path) return '';

    // Only optimize in production and if it is a png
    if (import.meta.env.PROD && path.toLowerCase().endsWith('.png')) {
        return path.replace(/\.png$/i, '.webp');
    }

    return path;
};
