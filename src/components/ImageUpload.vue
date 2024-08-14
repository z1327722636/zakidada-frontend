<template>
  <a-space direction="vertical" :style="{ width: '100%' }">
    <a-upload
      :fileList="file ? [file] : []"
      :show-file-list="false"
      :custom-request="customRequest"
    >
      <template #upload-button>
        <div
          :class="`arco-upload-list-item${
            file && file.status === 'error' ? ' arco-upload-list-item-error' : ''
          }`"
        >
          <div
            class="arco-upload-list-picture custom-upload-avatar"
            v-if="file && file.url && value"
          >
            <img :src="file.url" alt="" />
            <div class="arco-upload-list-picture-mask">
              <IconEdit />
            </div>
            <a-progress
              v-if="file.status === 'uploading' && file.percent < 100"
              :percent="file.percent"
              type="circle"
              size="mini"
              :style="{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translateX(-50%) translateY(-50%)'
              }"
            />
          </div>
          <div class="arco-upload-picture-card" v-else>
            <div class="arco-upload-picture-card-text">
              <IconPlus />
              <div style="margin-top: 10px; font-weight: 600">上传</div>
            </div>
          </div>
        </div>
      </template>
    </a-upload>
  </a-space>
</template>

<script setup lang="ts">
import { IconEdit, IconPlus } from '@arco-design/web-vue/es/icon'
import { defineProps, ref, toRefs, watchEffect, withDefaults } from 'vue'
import { uploadFileUsingPost } from '@/api/fileController'
import { Message } from '@arco-design/web-vue'

/**
 * 定义组件属性类型
 */
interface Props {
  biz: string
  onChange?: (url: string) => void
  value?: string
}

/**
 * 给组件指定初始值
 */
const props = withDefaults(defineProps<Props>(), {
  value: () => ''
})

const { value } = toRefs(props) // 使用 toRefs 将 props 转换为 ref
const file = ref()
watchEffect(() => {
  if (value.value) {
    file.value = {
      url: value.value,
      percent: 100,
      status: 'done'
    }
  }
})

// 自定义请求
//@ts-ignore
const customRequest = async (option: any) => {
  const { onError, onSuccess, fileItem } = option
  try {
    const res: any = await uploadFileUsingPost({ biz: props.biz }, {}, fileItem.file)
    if (res.data.code === 0 && res.data.data) {
      const url = res.data.data
      file.value = {
        name: fileItem.name,
        file: fileItem.file,
        url
      }
      props.onChange?.(url)
      onSuccess()
      console.log(file.value)
    } else {
      Message.error('上传失败，' + res.data.message || '')
      onError(new Error(res.data.message))
    }
  } catch (e: any) {
    Message.error('上传失败，' + e.message || '')
    onError(new Error(e.message))
  }
}
</script>
