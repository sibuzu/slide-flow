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
        const files = await glob(`${inputDir}/**/*.png`);

        console.log(`Found ${files.length} PNG files to optimize.`);

        for (const file of files) {
            const relativePath = path.relative(inputDir, file);
            // Construct target paths
            const targetPath = path.join(outputDir, relativePath).replace(/\.png$/i, '.webp');
            const targetSmallPath = targetPath.replace(/\.webp$/, '-small.webp');

            const targetFolder = path.dirname(targetPath);

            // Ensure target folder exists
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder, { recursive: true });
            }

            // Check if conversion is needed
            let needsConversion = true;
            if (fs.existsSync(targetPath) && fs.existsSync(targetSmallPath)) {
                const sourceStats = fs.statSync(file);
                const targetStats = fs.statSync(targetPath);
                const targetSmallStats = fs.statSync(targetSmallPath);

                // If targets are newer than source, skip
                if (targetStats.mtime > sourceStats.mtime && targetSmallStats.mtime > sourceStats.mtime) {
                    needsConversion = false;
                    process.stdout.write('s'); // s = skipped
                }
            }

            if (needsConversion) {
                const sharpInstance = sharp(file);
                // Main Image (Unified): Resize to max 1920x1920, Quality 75
                await sharpInstance.clone()
                    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 75, effort: 6 })
                    .toFile(targetPath);

                // Small Image (LQIP): Resize to width 200, Quality 50
                // Increased to 200px for better preview quality
                await sharpInstance.clone()
                    .resize({ width: 200 })
                    .webp({ quality: 50, effort: 4 })
                    .toFile(targetSmallPath);

                process.stdout.write('.'); // . = converted
            }

            // Remove original PNG from dist to save space
            const distPngPath = path.join(outputDir, relativePath);
            if (fs.existsSync(distPngPath)) {
                fs.unlinkSync(distPngPath);
            }
        }

        console.log('\n🧹 Starting cleanup...');

        // Scan dist/sliders for cleanup
        const distFiles = await glob(`${outputDir}/**/*`);
        let removedCount = 0;

        for (const distFile of distFiles) {
            // 1. Remove Zone.Identifier files
            if (distFile.includes(':Zone.Identifier')) {
                fs.unlinkSync(distFile);
                console.log(`🗑️  Deleted metadata: ${distFile}`);
                removedCount++;
                continue;
            }

            // 2. Sync Deletion: If WebP exists in dist but PNG missing in public
            if (distFile.endsWith('.webp')) {
                const relativePath = path.relative(outputDir, distFile);
                let sourcePng = '';

                // Clean up deprecated variants
                if (distFile.endsWith('-tiny.webp') || distFile.endsWith('-mobile.webp')) {
                    fs.unlinkSync(distFile);
                    console.log(`🗑️  Deleted deprecated file: ${distFile}`);
                    removedCount++;
                    continue;
                }

                // Handle standard variants
                if (distFile.endsWith('-small.webp')) {
                    sourcePng = path.join(inputDir, relativePath).replace(/-small\.webp$/, '.png');
                } else {
                    sourcePng = path.join(inputDir, relativePath).replace(/\.webp$/, '.png');
                }

                if (!fs.existsSync(sourcePng)) {
                    fs.unlinkSync(distFile);
                    console.log(`🗑️  Deleted stale file: ${distFile}`);
                    removedCount++;
                }
            }
        }

        console.log(`\n✨ Image optimization & cleanup complete! (${removedCount} files removed)`);
    } catch (error) {
        console.error('❌ Image optimization failed:', error);
        process.exit(1);
    }
}

convertToWebp();
