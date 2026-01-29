<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSlideStore } from '../stores/slide'

const route = useRoute()
const router = useRouter()
const store = useSlideStore()

const id = route.params.id
const presentation = computed(() => store.manifest.find(p => p.id === id))

const goHome = () => router.push('/')
</script>

<template>
  <div class="min-h-screen bg-neutral-900 text-white p-8">
    <div v-if="!presentation" class="flex flex-col items-center justify-center h-[80vh]">
        <p class="text-xl text-neutral-400">Presentation Not Found</p>
        <button @click="goHome" class="mt-4 px-6 py-2 bg-neutral-700 hover:bg-neutral-600 rounded transition-colors">
            Go Home
        </button>
    </div>

    <div v-else class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
            <button @click="goHome" class="p-2 rounded-full hover:bg-neutral-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </button>
            <h1 class="text-3xl font-bold">{{ presentation.title }}</h1>
        </div>

        <!-- Chapters Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="chap in presentation.chapters" :key="chap.id"
                 class="bg-neutral-800 rounded-xl overflow-hidden shadow-lg hover:ring-2 ring-blue-500 transition-all cursor-pointer group"
                 @click="router.push(`/viewer/${id}/${chap.id}`)">
                
                <!-- Thumbnails Preview (First 3 slides) -->
                <div class="aspect-video bg-neutral-900 relative p-2 grid grid-cols-3 gap-1 overflow-hidden">
                    <div v-for="(slide, idx) in chap.slides.slice(0, 3)" :key="idx" 
                         class="relative w-full h-full rounded overflow-hidden">
                        <img :src="slide" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity">
                    </div>
                </div>

                <div class="p-6">
                    <h2 class="text-xl font-bold mb-2">{{ chap.title }}</h2>
                    <p class="text-neutral-400 text-sm">{{ chap.slides.length }} slides</p>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
