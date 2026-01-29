import { defineStore } from 'pinia'

export const useSlideStore = defineStore('slide', {
    state: () => ({
        manifest: [],
        currentSlide: null
    }),
    actions: {
        async fetchManifest() {
            try {
                const response = await fetch('/sliders/manifest.json')
                this.manifest = await response.json()
            } catch (error) {
                console.error('Failed to fetch manifest:', error)
            }
        }
    }
})
