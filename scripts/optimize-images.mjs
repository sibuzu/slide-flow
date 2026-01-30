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

        // Find all image files in public/sliders (png, jpg, jpeg, webp)
        const files = await glob(`${inputDir}/**/*.{png,jpg,jpeg,webp}`);

        console.log(`Found ${files.length} image files to optimize.`);

        for (const file of files) {
            const relativePath = path.relative(inputDir, file);
            const ext = path.extname(file).toLowerCase();
            const fileName = path.basename(file, ext);
            // Identify cover files
            const isCover = fileName.toLowerCase().startsWith('cover');

            // Construct target paths
            // Always output .webp
            const targetPath = path.join(outputDir, relativePath).replace(new RegExp(`${ext}$`, 'i'), '.webp');
            const targetSmallPath = targetPath.replace(/\.webp$/, '-small.webp');

            const targetFolder = path.dirname(targetPath);

            // Ensure target folder exists
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder, { recursive: true });
            }

            // Check if processing is needed
            let needsProcessing = true;

            // For covers, we don't expect a small file. For others, we do.
            const allTargetsExist = isCover
                ? fs.existsSync(targetPath)
                : (fs.existsSync(targetPath) && fs.existsSync(targetSmallPath));

            if (allTargetsExist) {
                const sourceStats = fs.statSync(file);
                const targetStats = fs.statSync(targetPath);

                // If not cover, also check small file stats
                let targetsNewer = targetStats.mtime > sourceStats.mtime;

                if (!isCover && targetsNewer) {
                    const targetSmallStats = fs.statSync(targetSmallPath);
                    targetsNewer = targetsNewer && (targetSmallStats.mtime > sourceStats.mtime);
                }

                // If targets are newer than source, skip
                if (targetsNewer) {
                    needsProcessing = false;
                    process.stdout.write('s'); // s = skipped
                }
            }

            if (needsProcessing) {
                const sharpInstance = sharp(file);

                if (isCover) {
                    // Cover Image: Resize to width 800, Quality 80
                    // No small variant generated
                    await sharpInstance
                        .resize({ width: 800, withoutEnlargement: true })
                        .webp({ quality: 80, effort: 6 })
                        .toFile(targetPath);

                    // If a stale small file exists for cover, remove it (cleanup)
                    if (fs.existsSync(targetSmallPath)) {
                        fs.unlinkSync(targetSmallPath);
                    }
                } else {
                    // Standard Slides
                    // If source is already WebP, copy main image directly (assume optimized 1920px)
                    if (ext === '.webp') {
                        fs.copyFileSync(file, targetPath);

                        // Generate small version only
                        await sharp(file)
                            .resize({ width: 200 })
                            .webp({ quality: 50, effort: 4 })
                            .toFile(targetSmallPath);
                    } else {
                        // For others (png, jpg), convert and optimize

                        // Main Image: Resize to max 1920x1920, Quality 75
                        await sharpInstance.clone()
                            .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
                            .webp({ quality: 75, effort: 6 })
                            .toFile(targetPath);

                        // Small Image (LQIP): Resize to width 200, Quality 50
                        await sharpInstance.clone()
                            .resize({ width: 200 })
                            .webp({ quality: 50, effort: 4 })
                            .toFile(targetSmallPath);
                    }
                }

                process.stdout.write('.'); // . = converted/copied
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

            // 2. Sync Deletion: If WebP exists in dist but source missing in public
            if (distFile.endsWith('.webp')) {
                const relativePath = path.relative(outputDir, distFile);

                // Clean up deprecated variants
                if (distFile.endsWith('-tiny.webp') || distFile.endsWith('-mobile.webp')) {
                    fs.unlinkSync(distFile);
                    console.log(`🗑️  Deleted deprecated file: ${distFile}`);
                    removedCount++;
                    continue;
                }

                // Determine potential source file path (ignore extension)
                // We check if ANY supported source file exists for this output
                let relativeBaseName = '';
                if (distFile.endsWith('-small.webp')) {
                    relativeBaseName = relativePath.replace(/-small\.webp$/, '');
                } else {
                    relativeBaseName = relativePath.replace(/\.webp$/, '');
                }

                // Check against supported extensions
                const possibleExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
                let sourceExists = false;

                for (const ext of possibleExtensions) {
                    const possibleSource = path.join(inputDir, relativeBaseName + ext);
                    if (fs.existsSync(possibleSource)) {
                        sourceExists = true;
                        break;
                    }
                }

                if (!sourceExists) {
                    fs.unlinkSync(distFile);
                    console.log(`🗑️  Deleted stale file: ${distFile}`);
                    removedCount++;
                }
            } else if (distFile.endsWith('.png') || distFile.endsWith('.jpg') || distFile.endsWith('.jpeg')) {
                // Remove copied raw assets (like original PNGs that vite might have processed/copied if configured, 
                // though strictly we are manually handling this dir, removing them is safe if we strictly use webp)
                fs.unlinkSync(distFile);
                removedCount++;
            }
        }

        console.log(`\n✨ Image optimization & cleanup complete! (${removedCount} files removed)`);
    } catch (error) {
        console.error('❌ Image optimization failed:', error);
        process.exit(1);
    }
}

convertToWebp();
