import { defineStore } from 'pinia'
import slidesData from 'virtual:slides'

export const useSlideStore = defineStore('slide', {
    state: () => ({
        manifest: slidesData,
        currentSlide: null
    }),
    actions: {
        fetchManifest() {
            // No-op for compatibility, data is already loaded via import
            this.manifest = slidesData
        },
        findNode(id) {
            const find = (nodes, targetId) => {
                for (const node of nodes) {
                    if (node.id === targetId) return node;
                    if (node.children) {
                        const found = find(node.children, targetId);
                        if (found) return found;
                    }
                }
                return null;
            }
            return find(this.manifest, id);
        }
    }
})
