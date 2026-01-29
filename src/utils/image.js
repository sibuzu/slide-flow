/**
 * Resolves the image path based on environment.
 * In Production: Replaces .png with .webp for optimized assets.
 * In Development: Returns original path (serving local .png).
 * 
 * @param {string} path - The original image path (e.g., "/sliders/topic/01.png")
 * @returns {string} - The resolved path
 */
export const getImagePath = (path) => {
    if (!path) return { src: '', placeholder: null };

    // Only optimize in production and if it is a png
    if (import.meta.env.PROD && path.toLowerCase().endsWith('.png')) {
        return {
            src: path.replace(/\.png$/i, '.webp'),
            placeholder: path.replace(/\.png$/i, '-small.webp')
        };
    }

    // Dev mode: return original png, no placeholder (or use same if desired, but we only generate small in build)
    return {
        src: path,
        placeholder: null
    };
};
