<script setup>
import { onMounted } from 'vue'
import { useSlideStore } from './stores/slide'

const store = useSlideStore()

onMounted(() => {
  store.fetchManifest()
})
</script>

<template>
  <div class="min-h-screen text-slate-800">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
