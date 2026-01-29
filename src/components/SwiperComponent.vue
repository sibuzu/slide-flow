<script setup>
import { computed } from 'vue'
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

import { onMounted, onUnmounted } from 'vue'

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
        <swiper-slide v-for="(slide, index) in slides" :key="index" class="bg-black flex items-center justify-center">
            <img :src="slide" class="w-full h-full object-contain" loading="lazy" />
        </swiper-slide>
        </swiper>
    </div>
  </div>
</template>
