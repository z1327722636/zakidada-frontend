<template>
  <div name="app">
    <router-view />
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';

/**
 * 全局初始化函数，有全局单次调用的代码，都可以写到这里
 */
const doInit = () => {
  console.log("hello 欢迎来到我的项目");
};

onMounted(() => {
  doInit();
});

</script>
<style scoped>
.body {
  background: white;
}

#app {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden
}
</style>
