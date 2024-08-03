<script setup lang="ts">
import { useLoginUserStore } from '@/store/userStore';
const loginUserStore = useLoginUserStore();

</script>

<template>
  <div>{{ loginUserStore.loginUser.id }}||{{ loginUserStore.loginUser.userName }}</div>
  <div>管理员界面</div>
</template>
