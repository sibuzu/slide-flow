<script setup>
import { useSlideStore } from '../stores/slide'
import { onMounted, computed } from 'vue'
import { getImagePath } from '../utils/image'

const store = useSlideStore()
const manifest = computed(() => store.manifest)

onMounted(() => {
    store.fetchManifest()
})
</script>

<template>
  <div class="max-w-[1200px] mx-auto p-8 flex flex-col justify-center min-h-screen">
    <header class="text-center mb-16 animate-fade-down">
        <h1 class="text-5xl font-extrabold text-slate-800 mb-2 tracking-tight">SlideFlow<span class="text-blue-500">.</span></h1>
        <p class="text-lg text-slate-500">Simple · Professional · Data-Driven</p>
    </header>

    <div v-if="manifest.length === 0" class="text-center text-slate-400 py-12">
      No slides found. Add some to public/sliders and run gen_manifest.py.
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="item in manifest" :key="item.id" 
           class="bg-white border border-slate-200 rounded-2xl overflow-hidden card-hover cursor-pointer flex flex-col h-full"
           @click="item.subgroup ? $router.push({ name: 'chapters', params: { id: item.id } }) : $router.push({ name: 'viewer', params: { id: item.id } })">
        
        <!-- Image Wrapper -->
        <div class="aspect-video relative border-b border-slate-100 bg-slate-50 overflow-hidden">
          <img v-if="item.cover" :src="getImagePath(item.cover)" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
            No Cover
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 flex flex-col flex-1">
          <h2 class="text-xl font-bold text-slate-800 mb-2 truncate">{{ item.title }}</h2>
          <!-- Action Footer -->
          <div class="flex items-center text-blue-500 font-semibold text-sm mt-auto">
             <span>{{ item.subgroup ? 'Browse Chapters' : 'View Slides' }}</span>
             <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
