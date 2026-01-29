
import fs from 'fs';
import path from 'path';

export default function SlideLoaderPlugin() {
    const virtualModuleId = 'virtual:slides';
    const resolvedVirtualModuleId = '\0' + virtualModuleId;
    const slidersDir = 'public/sliders';

    const getImages = (dir) => {
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir)
            .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file))
            .filter(file => !/^cover\./i.test(file))
            .sort() // Ensure consistent order
            .map(file => path.basename(file));
    };

    const getCover = (dir) => {
        if (!fs.existsSync(dir)) return null;
        const files = fs.readdirSync(dir);
        const coverFile = files.find(file => file.toLowerCase().startsWith('cover.') && /\.(png|jpg|jpeg|webp)$/i.test(file));

        if (coverFile) return coverFile;

        // Fallback to first image
        const images = files.filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file)).sort();
        return images.length > 0 ? images[0] : null;
    };

    const loadConfig = (dir) => {
        const configPath = path.join(dir, 'config.json');
        if (fs.existsSync(configPath)) {
            try {
                return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            } catch (e) {
                console.warn(`[SlidePlugin] Invalid JSON in ${configPath}`);
            }
        }
        return {}; // Default empty config
    };

    const scanSlides = () => {
        const root = path.resolve(slidersDir);
        if (!fs.existsSync(root)) return [];

        const items = fs.readdirSync(root).filter(f => fs.statSync(path.join(root, f)).isDirectory());

        return items.map(itemName => {
            const itemPath = path.join(root, itemName);
            const config = loadConfig(itemPath);
            const cover = getCover(itemPath);

            const entry = {
                id: itemName,
                title: config.title || itemName,
                orient: config.orient || 'landscape',
                subgroup: !!config.subgroup,
                cover: cover ? `/sliders/${itemName}/${cover}` : null,
            };

            if (config.subgroup) {
                // Scan chapters (subdirectories)
                const chapters = fs.readdirSync(itemPath)
                    .filter(f => fs.statSync(path.join(itemPath, f)).isDirectory())
                    .sort(); // Sort chapters typically by name (e.g., 202512, 202601)

                entry.chapters = chapters.map(chapName => {
                    const chapPath = path.join(itemPath, chapName);
                    const chapConfig = loadConfig(chapPath);
                    const cover = getCover(chapPath);
                    const images = getImages(chapPath);

                    return {
                        id: chapName,
                        title: chapConfig.title || chapName,
                        cover: cover ? `/sliders/${itemName}/${chapName}/${cover}` : null,
                        slides: images.map(img => `/sliders/${itemName}/${chapName}/${img}`)
                    };
                });
            } else {
                // Flat structure
                const images = getImages(itemPath);
                entry.slides = images.map(img => `/sliders/${itemName}/${img}`);
            }

            return entry;
        });
    };

    return {
        name: 'vite-plugin-slides',
        resolveId(id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },
        load(id) {
            if (id === resolvedVirtualModuleId) {
                const data = scanSlides();
                return `export default ${JSON.stringify(data)}`;
            }
        },
        // HMR: Reload when files in public/sliders change
        handleHotUpdate({ file, server }) {
            if (file.includes(slidersDir)) {
                const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
                if (mod) {
                    server.moduleGraph.invalidateModule(mod);
                    server.ws.send({
                        type: 'full-reload',
                        path: '*'
                    });
                }
            }
        }
    };
}
