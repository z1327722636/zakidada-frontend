<template>
  <div id="basic-layout">
    <a-layout style="height: 100vh;">
      <a-layout-header>
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://github.com/z1327722636"> @程序员zaki出品</a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>
<script setup>
import GlobalHeader from '../components/GlobalHeader.vue'



</script>
<style scoped>
#basic-layout {}

.content {
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 28px;
  padding: 20px;
  width: 100vw;
}

.footer {
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background-color: #efefef;

}

a {
  color: #000
}
</style>
