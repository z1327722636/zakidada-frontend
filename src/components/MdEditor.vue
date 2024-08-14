<template>
  <Editor :value="value" :plugins="plugins" @change="handleChange" />
</template>

<script setup lang="ts">
import { defineProps, ref, withDefaults } from 'vue'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
//@ts-ignore
import { Editor } from '@bytemd/vue-next'

/**
 * 定义组件属性类型
 */
interface Props {
  value: string
  mode?: string
  handleChange: (v: string) => void
}

/**
 * 给组件指定初始值
 */
const props = withDefaults(defineProps<Props>(), {
  value: '',
  mode: 'split',
  handleChange: (v: string) => {
    console.log(v)
  }
})

const value = ref(props.value)

const plugins = [
  gfm(),
  highlight()
  // Add more plugins here
]

const handleChange = (v: string) => {
  value.value = v
  props.handleChange(v)
}
</script>

<style scoped>
.bytemd-toolbar-icon.bytemd-tippy.bytemd-tippy-right:last-child {
  display: none;
}
</style>
