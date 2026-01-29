/**
 * Resolves the image path based on environment.
 * In Production: Replaces .png with .webp for optimized assets.
 * Returns object with src and placeholder (LQIP).
 * 
 * @param {string} path - The original image path (e.g., "/sliders/topic/01.png")
 * @returns {object} - { src, placeholder }
 */
export const getImagePath = (path) => {
    if (!path) return { src: '', placeholder: null };

    // Only optimize in production and if it is a png
    if (import.meta.env.PROD && path.toLowerCase().endsWith('.png')) {
        const base = path.replace(/\.png$/i, '');
        return {
            src: `${base}.webp`,
            placeholder: `${base}-small.webp`
        };
    }

    // Dev mode
    return {
        src: path,
        placeholder: null
    };
};
