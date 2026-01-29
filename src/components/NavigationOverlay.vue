<script setup>
defineProps({
  visible: Boolean,
  hasNext: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'End of Slides'
  }
})
defineEmits(['next', 'back', 'home', 'cancel'])
</script>

<template>
  <div v-if="visible" class="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300">
    <div class="bg-neutral-900 p-8 rounded-xl max-w-sm w-full text-center shadow-2xl border border-neutral-800">
      <h3 class="text-xl font-bold mb-6 text-white">{{ title }}</h3>
      <div class="space-y-3">
        <button v-if="hasNext" @click="$emit('next')" class="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2">
          <span>Next Chapter</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
        
        <button @click="$emit('back')" class="w-full py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors border border-neutral-700">
          Back to Menu
        </button>
        
        <button @click="$emit('home')" class="w-full py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors border border-neutral-700">
          Home
        </button>
        
        <button @click="$emit('cancel')" class="w-full py-2 text-neutral-500 hover:text-neutral-300 mt-2 text-sm">
          Cancel (Stay Here)
        </button>
      </div>
    </div>
  </div>
</template>
