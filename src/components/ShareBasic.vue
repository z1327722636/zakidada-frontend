<template>
  <div>{{ link }}</div>
  <img :src="codeImg" alt="分享二维码" />
</template>

<script setup lang="ts">
//ts-ignore
import QRCode from 'qrcode'
import { ref } from 'vue'
//npm install --save qrcode

const link = ''
const codeImg = ref()

// With promises
QRCode.toDataURL(link)
  .then((url) => {
    console.log(url)
    codeImg.value = url
  })
  .catch((err) => {
    console.error(err)
  })
</script>
