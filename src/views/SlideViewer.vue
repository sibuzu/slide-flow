<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSlideStore } from '../stores/slide'
import SwiperComponent from '../components/SwiperComponent.vue'
import NavigationOverlay from '../components/NavigationOverlay.vue'

const route = useRoute()
const router = useRouter()
const store = useSlideStore()

const id = route.params.id
const chapterId = route.params.chapterId

const presentation = computed(() => store.manifest.find(p => p.id === id))

const currentChapterIndex = computed(() => {
    if (!presentation.value?.chapters) return -1
    return presentation.value.chapters.findIndex(c => c.id === chapterId)
})

const nextChapterId = computed(() => {
    if (currentChapterIndex.value === -1) return null
    if (currentChapterIndex.value < presentation.value.chapters.length - 1) {
        return presentation.value.chapters[currentChapterIndex.value + 1].id
    }
    return null
})

const slides = computed(() => {
    if (!presentation.value) return []
    
    if (presentation.value.subgroup && chapterId) {
        const chapter = presentation.value.chapters.find(c => c.id === chapterId)
        return chapter ? chapter.slides : []
    }
    
    return presentation.value.slides || []
})

const currentSlideIndex = ref(0)
const showOverlay = ref(false)

const onReachEnd = () => {
    showOverlay.value = true
}

const goHome = () => router.push('/')
const goBack = () => {
    if (presentation.value?.subgroup && chapterId) {
        router.push(`/viewer/${id}`) // Back to chapter list
    } else {
        router.push('/')
    }
}

const onNextChapter = () => {
    if (nextChapterId.value) {
        showOverlay.value = false
        router.push(`/viewer/${id}/${nextChapterId.value}`)
    }
}

// Fullscreen
const isFullscreen = ref(false)
const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        isFullscreen.value = true
    } else {
        document.exitFullscreen()
        isFullscreen.value = false
    }
}

const onFsChange = () => {
    isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
    document.addEventListener('fullscreenchange', onFsChange)
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFsChange)
})
</script>

<template>
  <div class="h-screen w-screen bg-black overflow-hidden relative group"> 
    <div v-if="!presentation" class="flex flex-col items-center justify-center h-full text-white">
        <p>Loading or Presentation Not Found...</p>
        <button @click="goHome" class="mt-4 px-4 py-2 bg-neutral-700 rounded">Go Home</button>
    </div>

    <!-- Chapter Selection -->
    <div v-else-if="presentation.subgroup && !chapterId" class="h-full p-8 flex flex-col items-center justify-center">
        <h1 class="text-3xl mb-8 font-bold">{{ presentation.title }}</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl max-h-[70vh] overflow-y-auto">
            <div v-for="chap in presentation.chapters" :key="chap.id"
                 class="bg-neutral-800 p-6 rounded-lg hover:bg-neutral-700 cursor-pointer border border-neutral-700 hover:border-blue-500 transition-colors"
                 @click="router.push(`/viewer/${id}/${chap.id}`)">
                <h3 class="text-xl font-bold mb-2">{{ chap.title }}</h3>
                <p class="text-sm text-neutral-400">{{ chap.slides.length }} slides</p>
                <div class="mt-4 flex gap-2 overflow-hidden h-16 opacity-50">
                    <img v-for="img in chap.slides.slice(0,3)" :key="img" :src="img" class="h-full rounded object-cover aspect-[3/4]">
                </div>
            </div>
        </div>
        <button @click="goHome" class="mt-8 px-6 py-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">Back Home</button>
    </div>

    <!-- Viewer -->
    <div v-else class="w-full h-full relative">
        <SwiperComponent 
            :slides="slides" 
            :orient="presentation.orient"
            @reachEnd="onReachEnd"
            @slideChange="(idx) => currentSlideIndex = idx"
        />
        
        <!-- Top Left Back -->
        <button @click="goBack" class="absolute top-4 left-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </button>

        <!-- Top Right Fullscreen -->
        <button @click="toggleFullscreen" class="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
             <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
               <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
            </svg>
        </button>
        
        <!-- Bottom Counter -->
        <div class="absolute bottom-4 right-4 z-10 text-white/50 text-xs font-mono bg-black/30 px-2 py-1 rounded">
            {{ currentSlideIndex + 1 }} / {{ slides.length }}
        </div>

        <!-- Overlay -->
        <NavigationOverlay 
            :visible="showOverlay" 
            :hasNext="!!nextChapterId"
            :title="presentation.subgroup ? 'Chapter Finished' : 'Slides Finished'"
            @next="onNextChapter"
            @back="goBack"
            @home="router.push('/')"
            @cancel="showOverlay = false"
        />
    </div>
  </div>
</template>
