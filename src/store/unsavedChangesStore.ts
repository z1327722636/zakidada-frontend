import {defineStore} from 'pinia'
import {ref} from 'vue'

/**
 * 全局未保存更改的检查逻辑
 */
export const useUnsavedChangesStore  = defineStore('unsavedChanges', () => {
  const hasUnsavedChanges = ref(false)

  const setUnsavedChanges = (value: boolean) => {
    hasUnsavedChanges.value = value
  }

  const checkUnsavedChanges = () => {
    if (hasUnsavedChanges.value) {
      if (confirm("您有未保存的更改，确定要离开吗？")) {
        setUnsavedChanges(false)
        return true
      } else{
        return false
      }
    }else{
      return true
    }
  }
  return { hasUnsavedChanges, setUnsavedChanges, checkUnsavedChanges }
})
