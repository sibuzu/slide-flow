<script setup>
import { computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectFade } from 'swiper/modules';
import 'swiper/css'
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

const modules = [EffectFade];

const containerClass = computed(() => {
  return props.orient === 'portrait' ? 'aspect-[9/16] h-[80vh]' : 'aspect-video w-full'
})
</script>

<template>
  <div class="flex items-center justify-center w-full h-full bg-black">
    <div :class="[containerClass, 'relative max-h-screen']">
        <swiper 
            :modules="modules"
            :slides-per-view="1" 
            :space-between="0" 
            effect="fade"
            class="w-full h-full"
            @reachEnd="$emit('reachEnd')"
            @slideChange="(s) => $emit('slideChange', s.activeIndex)"
        >
        <swiper-slide v-for="(slide, index) in slides" :key="index" class="bg-black flex items-center justify-center">
            <img :src="slide" class="w-full h-full object-contain" loading="lazy" />
        </swiper-slide>
        </swiper>
    </div>
  </div>
</template>
