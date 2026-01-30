<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Keyboard, EffectFade } from 'swiper/modules';
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/pagination'

const props = defineProps({
  slides: {
    type: Array,
    required: true
  },
  orient: {
    type: String,
    default: 'landscape'
  },
  initialSlide: {
    type: Number,
    default: 0
  }
})

const modules = [Navigation, Pagination, Keyboard, EffectFade];
const emit = defineEmits(['swiper', 'slideChange', 'attemptNext', 'rotationChanged', 'attemptPrev'])

// State
const loaded = ref({})
const isVisible = ref({})
const rotationStyles = ref({})
const slideRefs = ref([])
const activeIndex = ref(0)
let swiperInstance = null
let observer = null

// Device State
const isMobile = ref(false)
const isFullscreen = ref(false)

const swiperDirection = computed(() => {
    const style = rotationStyles.value[activeIndex.value]
    if (style && style.transform && style.transform.includes('rotate')) {
        return 'vertical'
    }
    return 'horizontal'
})

const emitRotationStatus = () => {
    const style = rotationStyles.value[activeIndex.value]
    const isRotated = style && style.transform && style.transform.includes('rotate')
    emit('rotationChanged', !!isRotated)
}

// Logic
const updateDeviceState = () => {
    isMobile.value = window.matchMedia('(max-width: 768px)').matches
    isFullscreen.value = !!document.fullscreenElement
    // Re-check rotations
    Object.keys(loaded.value).forEach(idx => checkRotation(idx))
    emitRotationStatus()
}

const checkRotation = (index) => {
    if (!loaded.value[index]) return;
    
    // Reset first
    rotationStyles.value[index] = {}

    // Only rotate if Mobile + Fullscreen
    if (!isMobile.value || !isFullscreen.value) return;

    // We need to look inside the slideRef for the picture/img element
    // The slideRefs array stores the swiper-slide element (or internal content depending on ref binding)
    // Here we bind ref to the swiper-slide root element (or container div inside)
    const el = slideRefs.value[index]
    if (!el) return;
    
    const imgEl = el.querySelector('.main-img')
    if (!imgEl) return;

    const isImgLandscape = imgEl.naturalWidth > imgEl.naturalHeight
    const isScreenPortrait = window.innerHeight > window.innerWidth

    if (isImgLandscape && isScreenPortrait) {
        rotationStyles.value[index] = {
            width: '100vh',
            height: '100vw',
            transform: 'rotate(90deg)',
            transformOrigin: 'center center',
            transformOrigin: 'center center',
            position: 'absolute',
            top: '50%',
            left: '50%',
            translate: '-50% -50%',
            maxWidth: 'none',
            maxHeight: 'none',
            zIndex: '10', // 9999 is excessive inside a slide
            objectFit: 'contain',
            backgroundColor: '#000'
        }
    }
}

const onImgLoad = (index, event) => {
    loaded.value[index] = true
    checkRotation(index)
}

// Intersection Observer for Lazy Load
const initObserver = () => {
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = entry.target.dataset.index
                if (index !== undefined) {
                    isVisible.value[index] = true
                    // Keep observing? or unobserve? 
                    observer.unobserve(entry.target)
                }
            }
        })
    }, { rootMargin: '50% 0px' }) // Preload when 50% away

    slideRefs.value.forEach((el, index) => {
        if (el && el.dataset) {
            el.dataset.index = index
            observer.observe(el)
        }
    })
}

// Custom Key Handler
const handleKeydown = (e) => {
    if (!swiperInstance) return
    // Left (37), Up (38), PgUp (33)
    if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 33) {
        if (swiperInstance.isBeginning) emit('attemptPrev')
        else swiperInstance.slidePrev()
    }
    // Right (39), Down (40), PgDn (34)
    if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 34) {
        if (swiperInstance.isEnd) emit('attemptNext')
        else swiperInstance.slideNext()
    }
}

const onSwiperRef = (s) => {
    swiperInstance = s
    emit('swiper', s)
}

// Preload Logic
const preloadSlides = (index) => {
    // Current slide
    if (index >= 0 && index < props.slides.length) {
        isVisible.value[index] = true
    }
    
    // Preload next 3 slides
    const start = index + 1
    const end = Math.min(index + 4, props.slides.length)
    
    for (let i = start; i < end; i++) {
        isVisible.value[i] = true
    }
    
    // Preload prev 1 slide (for back nav)
    if (index - 1 >= 0) {
        isVisible.value[index - 1] = true
    }
}

// Watchers & Hooks
watch(() => props.slides, () => {
    nextTick(() => {
        if (observer) {
            observer.disconnect()
            // Reset visibility on slide change? Or keep?
            // Usually we reset for new slides.
            isVisible.value = {}
            initObserver()
            // Initial preload
            preloadSlides(activeIndex.value)
        }
    })
})

watch(activeIndex, (newVal) => {
    emitRotationStatus()
    preloadSlides(newVal)
})

watch(() => rotationStyles.value[activeIndex.value], emitRotationStatus, { deep: true })
watch(swiperDirection, (newDir) => {
    if (swiperInstance) {
        swiperInstance.changeDirection(newDir)
        swiperInstance.update()
    }
})

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('resize', updateDeviceState)
    document.addEventListener('fullscreenchange', updateDeviceState)
    updateDeviceState()
    
    // Wait for swiper dom
    nextTick(() => {
        initObserver()
        preloadSlides(activeIndex.value)
    })
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('resize', updateDeviceState)
    document.removeEventListener('fullscreenchange', updateDeviceState)
    if (observer) observer.disconnect()
})
</script>

<template>
  <div class="flex items-center justify-center w-full h-full bg-black">
    <div class="w-full h-full relative">
        <swiper 
            :modules="modules"
            :direction="swiperDirection"
            :observer="true"
            :observe-parents="true"
            :speed="0"
            :slides-per-view="1" 
            :space-between="0" 
            :initial-slide="initialSlide"
            :pagination="{ clickable: true }"
            class="w-full h-full"
            @swiper="onSwiperRef"
            @slideChange="(s) => { activeIndex = s.activeIndex; $emit('slideChange', s.activeIndex) }"
        >
        <swiper-slide 
            v-for="(slide, index) in slides" 
            :key="index" 
            class="bg-black flex items-center justify-center relative overflow-hidden"
        >
             <!-- Wrapper div to capture Ref for Observer -->
             <div 
                :ref="(el) => slideRefs[index] = el" 
                class="w-full h-full flex items-center justify-center relative"
             >
                <!-- Blur Placeholder -->
                <img v-if="slide.placeholder" 
                     :src="slide.placeholder" 
                     class="absolute inset-0 w-full h-full object-contain blur-md scale-105 z-0 transition-opacity duration-500"
                     :class="{ 'opacity-0': loaded[index] }"
                />
                
                <!-- Main Image -->
                <!-- Use v-if=isVisible for lazy load -->
                <picture v-if="isVisible[index]" class="w-full h-full flex items-center justify-center">
                     <img 
                         :src="slide.src || slide" 
                         class="main-img w-full h-full object-contain relative z-10 transition-opacity duration-300"
                         :class="{ 'opacity-0': !loaded[index] && slide.placeholder, 'opacity-100': loaded[index] || !slide.placeholder }"
                         :style="rotationStyles[index]"
                         loading="lazy" 
                         @load="(e) => onImgLoad(index, e)"
                     />
                </picture>
            </div>
        </swiper-slide>
        </swiper>
    </div>
  </div>
</template>
