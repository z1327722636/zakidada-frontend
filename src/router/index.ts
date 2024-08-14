import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useUnsavedChangesStore } from '@/store/unsavedChangesStore'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const unsavedChangesStore = useUnsavedChangesStore()
  if (unsavedChangesStore.checkUnsavedChanges()) {
    unsavedChangesStore.setUnsavedChanges(false) // 清除未保存的标记
    next()
  } else {
    next(false)
  }
})

export { router }
