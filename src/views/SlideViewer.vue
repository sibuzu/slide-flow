<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSlideStore } from '../stores/slide'
import SwiperComponent from '../components/SwiperComponent.vue'
import NavigationOverlay from '../components/NavigationOverlay.vue'
import { getImagePath } from '../utils/image'

const route = useRoute()
const router = useRouter()
const store = useSlideStore()

const id = route.params.id
const chapterId = route.params.chapterId

const presentation = computed(() => store.manifest.find(p => p.id === id))

const currentChapterIndex = computed(() => {
    if (!presentation.value?.chapters) return -1
    const cId = route.params.chapterId
    return presentation.value.chapters.findIndex(c => c.id === cId)
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
    const cId = route.params.chapterId // Access reactive route params directly
    
    let rawSlides = []
    if (presentation.value.subgroup && cId) {
        const chapter = presentation.value.chapters.find(c => c.id === cId)
        rawSlides = chapter ? chapter.slides : []
    } else {
        rawSlides = presentation.value.slides || []
    }

    return rawSlides.map(getImagePath)
})

const currentSlideIndex = ref(0)
const showPrompt = ref(false)
const swiperInstance = ref(null)

const isEnd = computed(() => {
    return currentSlideIndex.value >= slides.value.length - 1
})

// Sync URL Query
const updateUrl = (idx) => {
    router.replace({
        query: { ...route.query, slide: idx + 1 },
        replace: true
    })
}

// Watch slide change -> update URL
watch(currentSlideIndex, (newVal) => {
    // Only update if different from query to avoid loop
    const querySlide = parseInt(route.query.slide)
    if (querySlide !== newVal + 1) {
        updateUrl(newVal)
    }
})

// Check Query on Mount/Change
watch(() => route.query.slide, (newVal) => {
    if (newVal && !isNaN(newVal)) {
        const idx = parseInt(newVal) - 1
        if (idx >= 0 && idx < slides.value.length && idx !== currentSlideIndex.value) {
            currentSlideIndex.value = idx
            if (swiperInstance.value) {
                swiperInstance.value.slideTo(idx, 0)
            }
        }
    }
}, { immediate: true })

const nextBtnRef = ref(null)

const onAttemptNext = () => {
    if (nextChapterId.value) {
        showPrompt.value = true
        // Focus next tick
        setTimeout(() => {
            nextBtnRef.value?.focus()
        }, 50)
    }
}

const nextSlide = () => {
    if (!swiperInstance.value) return
    
    if (isEnd.value) {
        onAttemptNext()
    } else {
        swiperInstance.value.slideNext()
    }
}

const prevSlide = () => {
    if (!swiperInstance.value) return
    swiperInstance.value.slidePrev()
}

const goHome = () => router.push('/')
const goBack = () => {
    if (presentation.value?.subgroup && chapterId) {
        router.push(`/chapters/${id}`) // Back to chapter list
    } else {
        router.push('/')
    }
}

const onNextChapter = () => {
    if (nextChapterId.value) {
        showPrompt.value = false
        // Push new route, router watcher should handle the rest
        router.push(`/viewer/${id}/${nextChapterId.value}?slide=1`)
    }
}

// ...

// Watch params to handle chapter changes or re-renders
watch(() => route.params, (newParams, oldParams) => {
    // Reset index if chapter changed
    if (newParams.chapterId !== oldParams?.chapterId) {
        currentSlideIndex.value = 0
    }

    if (swiperInstance.value) {
        // If swiper exists, the slide watcher below will handle index update via query
        // But we need to ensure query is set
        checkRoute()
    }
}, { deep: true })

// Fullscreen
const isFullscreen = ref(false)
const isRotated = ref(false)
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

// Route Check & Initialization
const checkRoute = () => {
    // Check Subgroup Root Redirect
    if (presentation.value?.subgroup && !route.params.chapterId) {
        router.replace(`/chapters/${id}`)
        return
    }

    // Default Query Param ?slide=1
    if (!route.query.slide) {
        router.replace({ ...route, query: { ...route.query, slide: 1 } })
    }
}

// Watch params to handle chapter changes or re-renders
watch(() => route.params, (newParams, oldParams) => {
    // Reset index if chapter changed
    if (newParams.chapterId !== oldParams?.chapterId) {
        currentSlideIndex.value = 0
    }

    // Reset if chapter changed
    if (swiperInstance.value) {
        // If swiper exists, the slide watcher below will handle index update via query
        // But we need to ensure query is set
        checkRoute()
    }
}, { deep: true })

onMounted(() => {
    document.addEventListener('fullscreenchange', onFsChange)
    checkRoute()
    // Query check is handled by immediate watch on route.query.slide
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

    <!-- Viewer -->
    <div v-else class="w-full h-full relative group">
        <SwiperComponent 
            :key="route.params.chapterId || route.params.id"
            :slides="slides" 
            :orient="presentation.orient"
            @swiper="(s) => swiperInstance = s"
            @slideChange="(idx) => currentSlideIndex = idx"
            @attemptNext="onAttemptNext"
            @rotationChanged="(v) => isRotated = v"
        />
        
        <!-- Custom Navigation Buttons -->
        <!-- Prev Button -->
        <button v-show="currentSlideIndex > 0" @click="prevSlide" 
                class="absolute z-20 p-3 bg-black/50 rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                :class="isRotated ? 'top-24 left-1/2 -translate-x-1/2 rotate-90' : 'top-1/2 left-4 -translate-y-1/2'">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </button>

        <!-- Next Button -->
        <button v-show="!isEnd || nextChapterId" @click="nextSlide" 
                class="absolute z-20 p-3 bg-black/50 rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                :class="isRotated ? 'bottom-16 left-1/2 -translate-x-1/2 rotate-90' : 'top-1/2 right-4 -translate-y-1/2'">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </button>

        <!-- Top Controls -->
        <div class="absolute top-4 left-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="goBack" class="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </button>
        </div>

        <button @click="toggleFullscreen" class="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100">
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

        <!-- Next Chapter Prompt (Lightweight) -->
        <div v-if="showPrompt" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex gap-4">
             <button ref="nextBtnRef" @click="onNextChapter" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg font-bold flex items-center gap-2 transform hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-blue-400">
                Next Chapter
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
             </button>
             <button @click="showPrompt = false" class="px-6 py-3 bg-neutral-800/80 hover:bg-neutral-800 text-white rounded-full shadow-lg backdrop-blur-sm border border-neutral-600">
                Cancel
             </button>
        </div>
    </div>
  </div>
</template>
