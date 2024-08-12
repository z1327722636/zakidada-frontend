<template>
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
      <div class="description">
        <span v-if="previewUrls.length === 0 || multiple">
          {{ isDragOver ? '释放即可上传' : `点击或者拖拽上传 ${multiple ? '多个' : '一个'}` }}
        </span>
      </div>
      <img
          v-if="!multiple && previewUrls.length > 0"
          :src="previewUrls[0].url"
          alt="上传图片的预览"
          class="preview-image"
      />
    </div>
    <div v-if="showError" class="error-popup">
      <span>{{ errorMessage }}</span>
      <button @click="closeErrorPopup">×</button>
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
        <button v-if="file.success === false" class="again-icon" @click="uploadAgain(index)">失败↺</button>
        <button @click="removeFile(index)">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, withDefaults, watch } from 'vue'

const props = withDefaults(defineProps<{
  multiple?: boolean
  accept?: string
  showPreview?: boolean
  maxSize?: number
  allowedTypes?: string[]
  uploadFunction: (params: { biz: string }, headers: {}, file: File, options: any) => Promise<any>
  uploadUrl: string
  biz: string
}>(), {
  multiple: true,
  accept: 'image/*',
  showPreview: true,
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/png', 'image/jpeg', 'image/jpg']
})

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const previewUrls = ref<{ url: string; name: string; progress: number; success?: boolean; file: File }[]>([])
const errorMessage = ref<string | null>(null)
const showError = ref(false)
const cancelUpload = ref<Function | null>(null)

const triggerFileSelect = () => fileInput.value?.click()

const handleFileChange = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) await handleFiles(files)
}

const handleDrop = async (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files) await handleFiles(files)
}

const handleDragOver = () => isDragOver.value = true
const handleDragEnter = () => isDragOver.value = true
const handleDragLeave = () => isDragOver.value = false

const handleFiles = async (files: FileList) => {
  const fileArray = Array.from(files)
  if (props.multiple) {
    await Promise.all(fileArray.map(validateAndPreview))
  } else {
    await validateAndPreview(fileArray[0])
  }
}

const validateAndPreview = async (file: File) => {
  if (props.allowedTypes && !props.allowedTypes.includes(file.type)) {
    showErrorPopup(`文件类型 ${file.type} 不被允许`)
    return
  }
  if (props.maxSize && file.size > props.maxSize) {
    showErrorPopup(`文件 ${file.name} 大小超过 ${props.maxSize / 1024 / 1024} MB`)
    return
  }

  const url = URL.createObjectURL(file)
  const previewFile = { url, name: file.name, progress: 0, success: null, file }
  previewUrls.value.push(previewFile)

  const onProgress = (progress: number) => {
    previewFile.progress = progress
  }

  const onFinish = (response: any) => {
    previewFile.success = response.success
    if (!response.success) {
      showErrorPopup(response.message || '上传失败')
    } else {
      previewFile.url = response.data.data // Adjust according to your response structure
    }
  }

  cancelUpload.value = await upload(file, onProgress, onFinish)
}

const uploadAgain = async (index: number) => {
  // 从 previewUrls 中移除指定的文件
  const fileData = previewUrls.value.splice(index, 1)[0]
  if (!fileData) return // 如果没有找到文件数据则返回

  // 重置进度和成功状态
  fileData.progress = 0
  fileData.success = null

  // 移除预览图的 URL 对象
  URL.revokeObjectURL(fileData.url)

  // 重新处理文件
  await validateAndPreview(fileData.file)
}

const cancel = (index: number) => {
  cancelUpload.value && cancelUpload.value()
  previewUrls.value[index].progress = 0
  previewUrls.value[index].success = false
}

const removeFile = (index: number) => {
  URL.revokeObjectURL(previewUrls.value[index].url)
  previewUrls.value.splice(index, 1)
}

const showErrorPopup = (message: string) => {
  errorMessage.value = message
  showError.value = true
  setTimeout(() => showError.value = false, 3000)
}

const closeErrorPopup = () => showError.value = false

const upload = async (file: File, onProgress: (progress: number) => void, onFinish: (resp: any) => void) => {
  if (props.uploadFunction) {
    try {
      await props.uploadFunction({ biz: props.biz }, {}, file, {
        onUploadProgress: (event: ProgressEvent) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded * 100) / event.total))
          }
        }
      }).then(response => onFinish({ success: true, data: response.data }))
          .catch(error => onFinish({ success: false, message: error.message || '上传失败' }))
    } catch (error) {
      onFinish({ success: false, message: error.message || '上传失败' })
    }
  } else {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', props.uploadUrl)
    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded * 100) / event.total))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onFinish(JSON.parse(xhr.responseText))
      } else {
        onFinish({ success: false, message: '上传失败' })
      }
    }
    xhr.onerror = () => onFinish({ success: false, message: '上传失败' })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('biz', props.biz)
    xhr.send(formData)
    return () => xhr.abort()
  }
}

watch(errorMessage, (newMessage) => {
  if (newMessage) showErrorPopup(newMessage)
})
</script>

<style scoped>
.image-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-area {
  width: 300px;
  height: 100px;
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

.description {
  text-align: center;
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
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

.success-icon, .error-icon, .again-icon {
  font-size: 16px;
  cursor: pointer;
}

.success-icon {
  color: green;
}

.error-icon {
  color: red;
}

.again-icon {
  color: red;
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
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 1; }
}
</style>
