<template>
  <div id="basic-layout">
    <a-layout class="layout">
      <a-layout-header>
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://github.com/z1327722636">@程序员zaki出品</a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup>
import GlobalHeader from '../components/GlobalHeader.vue'
</script>

<style scoped>
#basic-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

}

.layout {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.content {
  box-sizing: border-box;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto 28px;
  padding: 20px;
  flex: 1;
}

.footer {
  text-align: center;
  padding: 10px;
  background-color: #efefef;
}

a {
  color: #000;
  text-decoration: none;
}
</style>
