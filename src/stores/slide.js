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
        }
    }
})
