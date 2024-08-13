<template>
  <div class="container">
    <h2>Markdown Demo</h2>
    <Editor :value="markdownContent"
            :handleChange="handleChange" />
    <Viewer />
  </div>
  <div class="container2">
    <h2>Upload Demo</h2>
  <Upload biz="user_avatar" upload-url="http://localhost:8101/api/file/upload" upload-function="" :on-change="doChange"/>
  <ImageUpload biz="user_avatar"  :on-change="doChange"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Editor from '../components/MdEditor.vue'; // 假设 Editor 组件放在 components 目录下
import Viewer from '../components/MdViewer.vue'; // 假设 Viewer 组件放在 components 目录下
import 'bytemd/dist/index.css'
import Upload from "@/components/Upload.vue";
import API from '@/api'
import ImageUpload from "@/components/ImageUpload.vue";
// import {uploadFileUsingPost} from "@/api/fileController";

// 创建一个 ref 来存储 Markdown 内容
const markdownContent = ref<string>('给自己一个详细的介绍吧');

const handleChange = (value: string) => {
    markdownContent.value = value;
}
const doChange = (fileList: any) => {
  console.log(fileList)
}
</script>
<style scoped>
.bytemd {
  max-height: 600px;
}
.container{
  width: 300px;
}
</style>
