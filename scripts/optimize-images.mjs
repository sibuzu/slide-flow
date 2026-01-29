import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';

const inputDir = 'public/sliders';
const outputDir = 'dist/sliders';

async function convertToWebp() {
    console.log('🚀 Starting image optimization (WebP conversion)...');

    try {
        // Check if output directory exists (it should after vite build)
        if (!fs.existsSync(outputDir)) {
            console.warn(`⚠️  Output directory ${outputDir} does not exist. Creating it...`);
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Find all PNG files in public/sliders or dist/sliders
        // Since vite processes public files to dist, we can process dist directly or source -> dist
        // Recommendation: Source -> Dist overwriting/adding webp

        // Let's scan public directory to find source structure
        const files = await glob(`${inputDir}/**/*.png`);

        console.log(`Found ${files.length} PNG files to optimize.`);

        for (const file of files) {
            const relativePath = path.relative(inputDir, file);
            // Construct target path in dist with .webp extension
            const targetPath = path.join(outputDir, relativePath).replace(/\.png$/i, '.webp');
            const targetFolder = path.dirname(targetPath);

            // Ensure target folder exists
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder, { recursive: true });
            }

            // Check if conversion is needed
            let needsConversion = true;
            if (fs.existsSync(targetPath)) {
                const sourceStats = fs.statSync(file);
                const targetStats = fs.statSync(targetPath);

                // If target is newer than source, skip
                if (targetStats.mtime > sourceStats.mtime) {
                    needsConversion = false;
                    process.stdout.write('s'); // s = skipped
                }
            }

            if (needsConversion) {
                // Convert
                await sharp(file)
                    .webp({ quality: 80, effort: 6 })
                    .toFile(targetPath);
                process.stdout.write('.'); // . = converted
            }

            // Remove original PNG from dist to save space
            const distPngPath = path.join(outputDir, relativePath);
            if (fs.existsSync(distPngPath)) {
                fs.unlinkSync(distPngPath);
            }

            // process.stdout.write('.'); // Moved to logic blocks
        }

        console.log('\n✨ Image optimization complete!');
    } catch (error) {
        console.error('❌ Image optimization failed:', error);
        process.exit(1);
    }
}

convertToWebp();
