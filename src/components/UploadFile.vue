<template>
  <div id="upload">
    <div class="image-upload-container">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        :accept="accept"
        :multiple="multiple"
        hidden
      />
      <div
        class="upload-area"
        :class="{ 'upload-area-dragover': isDragOver }"
        @click="triggerFileSelect"
        @drop.prevent="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragenter.prevent="handleDragEnter"
        @dragleave.prevent="handleDragLeave"
      >
        <div class="upload-icon">+</div>
        <img
          v-if="!multiple && previewUrls.length > 0"
          :src="previewUrls[previewUrls.length - 1].url"
          alt="上传图片的预览"
          class="preview-image"
        />
      </div>
      <div class="description" v-if="previewUrls.length === 0 || multiple">
        <span v-if="!isDragOver">点击或者拖拽上传 {{ multiple ? '多个' : '一个' }}</span>
        <span v-else> 释放即可上传</span>
      </div>
      <div v-if="showError" class="error-popup">
        <span>{{ errorMessage }}</span>
        <button @click="closeErrorPopup">×</button>
      </div>
    </div>
    <div v-if="showPreview && previewUrls.length > 0" class="preview-list">
      <div class="preview-item" v-for="(file, index) in previewUrls" :key="index">
        <img :src="file.url" alt="预览图片" class="preview-image" />
        <a :href="file.url" target="_blank">{{ file.name }}</a>
        <div class="upload-progress" v-if="file.success === null">
          <div class="progress-bar" :style="{ width: file.progress + '%' }"></div>
        </div>
        <span v-if="file.success === true && file.progress === 100" class="success-icon">✔️</span>
        <button v-if="file.success === null" class="error-icon" @click="cancel(index)">❌</button>
        <button v-if="file.success === false" class="again-icon" @click="uploadAgain(index)">
          失败↺
        </button>
        <button @click="removeFile(index)">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, withDefaults } from 'vue'

const props = withDefaults(
  defineProps<{
    multiple?: boolean
    accept?: string
    showPreview?: boolean
    maxSize?: number
    allowedTypes?: string[]
    uploadFunction?: Function
    uploadUrl?: string
    biz: string
    onChange?: (
      fileList: { url: string; name: string; progress: number; success?: boolean; file: File }[]
    ) => void // 文件上传成功后的回调函数
  }>(),
  {
    multiple: true, // 是否支持多文件上传
    accept: 'image/*', // 支持的文件类型
    showPreview: true, // 是否显示预览
    maxSize: 1024 * 1024,
    allowedTypes: () => ['image/png', 'image/jpeg', 'image/jpg', 'image/svg', 'image/webp'] // 使用函数返回数组
  }
)

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const previewUrls = ref<
  { url: string; name: string; progress: number; success?: boolean; file: File }[]
>([])
const errorMessage = ref<string | null>(null)
const showError = ref<boolean>(false)
let cancelUpload = ref<Function | null>(null)

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    await handleFiles(target.files)
  }
}

const handleDrop = async (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    await handleFiles(files)
  }
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragEnter = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleFiles = async (files: FileList) => {
  const fileArray = Array.from(files)
  if (props.multiple) {
    await Promise.all(fileArray.map((file) => validateAndPreview(file)))
  } else {
    await validateAndPreview(fileArray[0])
  }
}

const validateAndPreview = async (file: File) => {
  if (props.allowedTypes && !props.allowedTypes.includes(file.type)) {
    errorMessage.value = `文件类型 ${file.type} 不被允许`
    showErrorPopup()
    return
  }
  if (props.maxSize && file.size > props.maxSize) {
    errorMessage.value = `文件 ${file.name} 大小超过 ${props.maxSize / 1024 / 1024} MB`
    showErrorPopup()
    return
  }
  const url = URL.createObjectURL(file)
  const previewFile = { url, name: file.name, progress: 0, success: false, file }
  previewUrls.value.push(previewFile)
  errorMessage.value = null
  const onProgress = (progress: number) => {
    previewFile.progress = progress
    previewUrls.value = [...previewUrls.value] // 确保数组引用变化，以触发视图更新
  }

  const onFinish = (response: any) => {
    if (response.success) {
      // 根据你的响应结构判断
      previewFile.success = true
      previewFile.url = response.data.data // 根据你的响应结构判断
      props.onChange && props.onChange(previewUrls.value)
      console.log(response.data.data)
    } else {
      previewFile.success = false
      errorMessage.value = response.message || '上传失败'
      showErrorPopup()
    }
    previewUrls.value = [...previewUrls.value] // 确保数组引用变化，以触发视图更新
  }

  cancelUpload.value = await upload(file, onProgress, onFinish)
}

const uploadAgain = async (index: number) => {
  // 从 previewUrls 中移除指定的文件
  const fileData = previewUrls.value.splice(index, 1)[0]
  if (!fileData) return // 如果没有找到文件数据则返回

  // 重置进度和成功状态
  fileData.progress = 0
  fileData.success = false

  // 移除预览图的 URL 对象
  URL.revokeObjectURL(fileData.url)

  // 重新处理文件
  await validateAndPreview(fileData.file)
}

const cancel = (index: number) => {
  cancelUpload.value && cancelUpload.value()
  previewUrls.value[index].progress = 0
  previewUrls.value[index].success = false
  previewUrls.value = [...previewUrls.value] // 确保数组引用变化，以触发视图更新
}

const upload = props.uploadFunction
  ? async (file: File, onProgress: (progress: number) => void, onFinish: (resp: any) => void) => {
      try {
        //@ts-ignore
        await props
          .uploadFunction({ biz: props.biz }, {}, file, {
            onUploadProgress: (event: ProgressEvent) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded * 100) / event.total)
                onProgress(progress)
              }
            }
          })
          .then((res: any) => {
            if (res.data.code === 0 && res.data.data) {
              onFinish({ success: true, data: res.data })
            } else {
              onFinish({ success: false, message: res.data.message })
            }
          })
          .catch((error: any) => {
            onFinish({ success: false, message: error.message || '上传失败' })
          })
      } catch (error: any) {
        onFinish({ success: false, message: error.message || '上传失败' })
      }
      return () => {}
    }
  : async (file: File, onProgress: (progress: number) => void, onFinish: (resp: any) => void) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', props.uploadUrl ?? '') // 使用传入的 uploadUrl
      // 设置 withCredentials 为 true 以携带 Cookie
      xhr.withCredentials = true

      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total)
          onProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText)
          console.log(res)
          if (res.code === 0 && res.data) {
            onFinish({ success: true, data: res })
          } else {
            onFinish({ success: false, message: res.message })
          }
        } else {
          onFinish({ success: false, message: '上传失败' })
        }
      }

      xhr.onerror = () => {
        onFinish({ success: false, message: '上传失败' })
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('biz', props.biz)
      xhr.send(formData)

      return () => {
        xhr.abort()
      }
    }

const removeFile = (index: number) => {
  URL.revokeObjectURL(previewUrls.value[index].url)
  previewUrls.value.splice(index, 1)
}

const showErrorPopup = () => {
  showError.value = true
  setTimeout(() => {
    showError.value = false
  }, 3000)
}

const closeErrorPopup = () => {
  showError.value = false
}

watch(errorMessage, (newMessage) => {
  if (newMessage) {
    showErrorPopup()
  }
})
</script>

<style scoped>
.image-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-area {
  height: 100%;
  width: 100%;
  min-height: 60px;
  min-width: 60px;
  font-size: 3em;
  color: #ccc;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 10px;
  transition: background-color 0.3s ease;
}

.upload-area-dragover {
  background-color: #f5f5f5;
  border: 2px dashed #4d76fc;
}

.upload-area:hover {
  background-color: #f5f5f5;
}

.preview-image {
  max-width: 95px;
  max-height: 95px;
}

.preview-list {
  width: 100%;
  margin-top: 10px;
}

.preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 5px;
  background-color: #f9f9f9;
}

.preview-item img {
  height: 20px;
  object-fit: cover;
  margin-right: 10px;
}

.preview-item a {
  flex-grow: 1;
  color: #3498db;
  text-decoration: none;
}

.preview-item a:hover {
  text-decoration: underline;
}

.upload-progress {
  flex-grow: 1;
  height: 5px;
  background-color: #e0e0e0;
  border-radius: 2px;
  margin: 0 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

.success-icon {
  color: green;
  margin-right: 10px;
}

.error-icon {
  color: red;
  margin-right: 10px;
}

.again-icon {
  color: red;
  margin-right: 10px;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #888;
}

button:hover {
  color: #333;
}

.error-popup {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffdddd;
  color: #d8000c;
  padding: 10px;
  border: 1px solid #d8000c;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0%,
  100% {
    opacity: 0;
  }
  10%,
  90% {
    opacity: 1;
  }
}
</style>
