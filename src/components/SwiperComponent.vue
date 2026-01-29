<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Keyboard, EffectFade } from 'swiper/modules';
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade';

const props = defineProps({
  slides: {
    type: Array,
    required: true
  },
  orient: {
    type: String,
    default: 'landscape'
  }
})

const modules = [Navigation, Pagination, Keyboard, EffectFade];

// Image loading state
const loaded = ref({})
const onImgLoad = (index) => {
    loaded.value[index] = true
}

const emit = defineEmits(['swiper', 'slideChange', 'attemptNext'])
let swiperInstance = null

const onSwiperRef = (s) => {
    swiperInstance = s
    emit('swiper', s)
}

// Custom keyboard handling to support Up/Down for Prev/Next
const handleKeydown = (e) => {
    if (!swiperInstance) return
    
    // Left (37) or Up (38) -> Prev
    if (e.keyCode === 37 || e.keyCode === 38) {
        swiperInstance.slidePrev()
    }
    // Right (39) or Down (40) -> Next
    if (e.keyCode === 39 || e.keyCode === 40) {
        if (swiperInstance.isEnd) {
            emit('attemptNext')
        } else {
            swiperInstance.slideNext()
        }
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="flex items-center justify-center w-full h-full bg-black">
    <div class="w-full h-full relative">
        <swiper 
            :slides-per-view="1" 
            :space-between="0" 
            effect="fade"
            :pagination="{ clickable: true }"
            :keyboard="{ enabled: true, onlyInViewport: false, pageUpDown: true }"
            class="w-full h-full"
            @swiper="onSwiperRef"
            @slideChange="(s) => $emit('slideChange', s.activeIndex)"
        >
        <swiper-slide v-for="(slide, index) in slides" :key="index" class="bg-black flex items-center justify-center relative overflow-hidden">
            <!-- Blur Placeholder -->
            <img v-if="slide.placeholder" 
                 :src="slide.placeholder" 
                 class="absolute inset-0 w-full h-full object-contain blur-md scale-105 z-0 transition-opacity duration-500"
                 :class="{ 'opacity-0': loaded[index] }"
            />
            
            <!-- Main Image -->
            <img :src="slide.src || slide" 
                 class="w-full h-full object-contain relative z-10 transition-opacity duration-300"
                 :class="{ 'opacity-0': !loaded[index] && slide.placeholder, 'opacity-100': loaded[index] || !slide.placeholder }"
                 loading="lazy" 
                 @load="onImgLoad(index)"
            />
        </swiper-slide>
        </swiper>
    </div>
  </div>
</template>
