<template>
  <a-card class="appCard" hoverable @click="doCardClick">
    <template #actions>
      <span class="icon-hover" @click.stop="doShare"> <IconShareInternal /> </span>
    </template>
    <template #cover>
      <div class="cover">
        <a-image class="cover-img" :alt="app.appName" :src="app.appIcon" />
      </div>
    </template>
    <a-card-meta :title="app.appName" :description="app.appDesc">
      <template #avatar>
        <div class="avatar-container">
          <a-avatar :size="24" :image-url="app.user?.userAvatar" class="avatar" />
          <a-typography-text>
            {{ app.user?.userName ?? '匿名' }}
          </a-typography-text>
        </div>
      </template>
    </a-card-meta>
  </a-card>
  <ShareModal :link="shareLink" title="应用分享" ref="shareModalRef" />
</template>

<script setup lang="ts">
import { IconShareInternal } from '@arco-design/web-vue/es/icon'
import API from '@/api'
import { defineProps, ref, withDefaults } from 'vue'
import { useRouter } from 'vue-router'
import ShareModal from '@/components/ShareModal.vue'
// import ShareModal from "@/components/ShareModal.vue";

const props = withDefaults(
  defineProps<{
    app: API.AppVO
  }>(),
  {
    app: () => {
      return {}
    }
  }
)

const router = useRouter()
const doCardClick = () => {
  router.push(`/app/detail/${props.app.id}`)
}

// 分享弹窗的引用
const shareModalRef = ref()

// 分享链接
const shareLink = `${window.location.protocol}//${window.location.host}/app/detail/${props.app.id}`

// 分享
const doShare = (e: Event) => {
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped>
.appCard {
  cursor: pointer;
  transition: transform 0.2s;
}

.appCard:hover {
  transform: translateY(-5px);
}

.icon-hover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.3s;
}

.icon-hover:hover {
  background-color: rgb(var(--gray-6));
}

.cover {
  height: 204px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片适应容器，同时保持图片比例 */
  transition: transform 0.3s;
}

.cover-img:hover {
  transform: scale(1.05);
}

.avatar-container {
  display: flex;
  align-items: center;
  color: #1d2129;
}

.avatar {
  margin-right: 8px;
}
</style>
