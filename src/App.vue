<template>
  <div name="app">
    <router-view></router-view>
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
#app{
  width: 100%;
  height: 100%;
}
</style>
