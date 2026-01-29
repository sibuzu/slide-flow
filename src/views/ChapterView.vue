<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSlideStore } from '../stores/slide'
import { getImagePath } from '../utils/image'

const route = useRoute()
const router = useRouter()
const store = useSlideStore()

const id = route.params.id
const presentation = computed(() => store.manifest.find(p => p.id === id))

const goHome = () => router.push('/')
</script>

<template>
  <div class="min-h-screen text-slate-800 p-8">
    <div v-if="!presentation" class="flex flex-col items-center justify-center h-[80vh]">
        <p class="text-xl text-slate-400">Presentation Not Found</p>
        <button @click="goHome" class="mt-4 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors">
            Go Home
        </button>
    </div>

    <div v-else class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-12">
            <button @click="goHome" class="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </button>
            <h1 class="text-3xl font-bold">{{ presentation.title }}</h1>
        </div>

        <!-- Chapters Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div v-for="chap in presentation.chapters" :key="chap.id"
                 class="bg-white border border-slate-200 rounded-2xl overflow-hidden card-hover cursor-pointer flex flex-col h-full group"
                 @click="router.push(`/viewer/${id}/${chap.id}`)">
                
                <!-- Thumbnails Preview (Cover or First 3 slides) -->
                <div class="aspect-video bg-slate-50 relative overflow-hidden border-b border-slate-100 group-hover:opacity-90 transition-opacity">
                     <template v-if="chap.cover">
                        <img :src="getImagePath(chap.cover).src" class="w-full h-full object-cover">
                     </template>
                     <div v-else class="w-full h-full p-2 grid grid-cols-3 gap-1">
                        <div v-for="(slide, idx) in chap.slides.slice(0, 3)" :key="idx" 
                             class="relative w-full h-full rounded overflow-hidden shadow-sm">
                            <img :src="getImagePath(slide).src" class="w-full h-full object-cover opacity-80">
                        </div>
                     </div>
                </div>

                <div class="p-6">
                    <h2 class="text-xl font-bold text-slate-800 mb-2">{{ chap.title }}</h2>
                    <p class="text-slate-500 text-sm mb-4">{{ chap.slides.length }} slides</p>
                    
                    <div class="flex items-center text-blue-500 font-semibold text-sm mt-auto">
                        <span>Play Chapter</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                           <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
                       </svg>
                     </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
