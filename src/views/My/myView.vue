<template>
  <div id="my">
    <div class="menu-my">
      <a-menu mode="vertical" :selected-keys="[selectedKeys]" @menu-item-click="doMenuItemClick">
        <a-menu-item v-for="item in currentChildrenRoutes" :key="item.path" :path="item.path">
          {{ item.name }}
        </a-menu-item>
      </a-menu>
    </div>
    <div class="myContent"><router-view /></div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { routes } from '@/router/routes'

const router = useRouter()
const route = useRoute()
const selectedKeys = ref(route.path) // 初始化为当前路径

// 动态计算当前路由的子路由数组
const currentChildrenRoutes = computed(() => {
  // 使用传递的父路由路径或默认为 `/`
  const parentRoutePath = '/my'
  const parentRoute = (routes as any)
    .find((r: any) => r.path === '/')
    .children.find((r: any) => r.path === parentRoutePath)
  return parentRoute ? parentRoute.children || [] : []
})

// 路由跳转后，更新选中的菜单项
router.afterEach((to) => {
  updateSelectedKeys(to.path)
})

const updateSelectedKeys = (path: any) => {
  selectedKeys.value = path
}

// 初始化选中项
onMounted(() => {
  updateSelectedKeys(route.path)
})

const doMenuItemClick = (key: any) => {
  router.push(key)
}
</script>

<style scoped>
#my {
  display: flex; /* 使用 flex 布局 */
  box-sizing: border-box;
}

.menu-my {
  box-sizing: border-box;
  width: 16%;
  border: 1px solid #efefef;
  border-radius: 4px;
}

.myContent {
  height: 100%;
  width: 84%;
  padding: 20px;
  overflow: auto;
  box-sizing: border-box;
}
</style>
