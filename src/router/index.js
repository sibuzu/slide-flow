import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SlideViewer from '../views/SlideViewer.vue'
import ChapterView from '../views/ChapterView.vue'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/chapters/:id',
            name: 'chapters',
            component: ChapterView
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
