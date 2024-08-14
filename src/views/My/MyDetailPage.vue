{ "compilerOptions": { "moduleResolution": "node", "types": ["vite/client", "vue", "vue-router"] } }
<template>
  <div class="profile-container">
    <div class="profile-header">
      <a-avatar alt="User Avatar" class="avatar"
        ><img v-if="user.avatar" alt="avatar" :src="user.avatar" />
        <span v-else>{{ user.userName ?? '匿名' }}</span>
      </a-avatar>
      <div class="user-info">
        <h2 class="username">{{ user.userName ?? '匿名' }}</h2>
        <!--        <p class="user-level">等级：{{ user.level }}</p>-->
        <p class="user-role">{{ user.userRole }}</p>
        <UpdataUser :user="user" :upUserData="onchangeData">编辑个人信息</UpdataUser>
      </div>
    </div>
    <!--    {{user}}-->
    <div class="profile-details">
      <h3>基本信息</h3>
      <a-descriptions style="margin-top: 20px" :data="data" size="large" :column="1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLoginUserStore } from '@/store/userStore'
import UpdataUser from '@/views/My/components/UpdataUser.vue'

const loginUserStore = useLoginUserStore()

const user = ref({
  avatar: loginUserStore.loginUser.userAvatar, // 头像的路径
  userName: loginUserStore.loginUser.userName,
  id: loginUserStore.loginUser.id,
  userAccount: loginUserStore.loginUser.userAccount,
  userProfile: loginUserStore.loginUser.userProfile,
  userRole: loginUserStore.loginUser.userRole
})
const data = computed(() => {
  return [
    {
      label: '用户昵称',
      value: user.value.userName
    },
    {
      label: '用户ID',
      value: user.value.id
    },
    {
      label: '用户账号',
      value: user.value.userAccount
    },
    {
      label: '性别',
      value: '隐藏'
    },
    {
      label: '个人简介',
      value: user.value.userProfile ?? '这个人很懒，什么都没有留下'
    }
  ]
})

const onchangeData = (updatedUser: any) => {
  user.value = { ...user.value, ...updatedUser }
}
</script>

<style scoped>
.profile-container {
  width: 100%;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-details {
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 20px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: bold;
}

.user-role {
  color: #f39c12;
}

.profile-details h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}
</style>
