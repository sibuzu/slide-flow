<script setup>
import { useSlideStore } from '../stores/slide'
import { storeToRefs } from 'pinia'

const store = useSlideStore()
const { manifest } = storeToRefs(store)
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-8">SlideFlow</h1>
    <div v-if="manifest.length === 0" class="text-neutral-400">
      No slides found. Add some to public/sliders and run gen_manifest.py.
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="item in manifest" :key="item.id" 
           class="bg-neutral-800 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-lg"
           @click="item.subgroup ? $router.push({ name: 'chapters', params: { id: item.id } }) : $router.push({ name: 'viewer', params: { id: item.id } })">
        <div class="aspect-video bg-neutral-700 relative">
          <img v-if="item.cover" :src="item.cover" class="w-full h-full object-cover">
          <div v-else class="w-full h-full flex items-center justify-center text-neutral-500">
            No Cover
          </div>
        </div>
        <div class="p-4">
          <h2 class="text-xl font-semibold text-white">{{ item.title }}</h2>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs text-neutral-300 bg-neutral-700 px-2 py-1 rounded">
                {{ item.orient }}
            </span>
             <span v-if="item.subgroup" class="text-xs text-blue-300 bg-blue-900/50 px-2 py-1 rounded">
                Chaptered
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
