import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SlideViewer from '../views/SlideViewer.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/viewer/:id',
            name: 'viewer',
            component: SlideViewer
        },
        {
            path: '/viewer/:id/:chapterId',
            name: 'viewer-chapter',
            component: SlideViewer
        }
    ]
})

export default router
