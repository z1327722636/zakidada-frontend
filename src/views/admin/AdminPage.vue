<template>
  <div id="adminPage">
    <div class="menu-admin">
      <a-menu
        mode="pop"
        :selected-keys="[selectedKeys]"
        @menu-item-click="doMenuItemClick"
        showCollapseButton
        default-collapsed
      >
        <a-menu-item v-for="item in currentChildrenRoutes" :key="item.path" :path="item.path">
          <template #icon>
            <span> {{ item.name?.charAt(0) }}</span>
          </template>
          {{ item.name }}
        </a-menu-item>
      </a-menu>
    </div>
    <div class="adminContent"><router-view /></div>
  </div>
</template>

<script setup lang="ts">
import { routes } from '@/router/routes'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'

const router = useRouter()
const route = useRoute()
const selectedKeys = ref(route.path) // 初始化为当前路径

// 动态计算当前路由的子路由数组
const currentChildrenRoutes = computed(() => {
  // 使用传递的父路由路径或默认为 `/`
  const parentRoutePath = '/admin'
  const parentRoute = routes
    .find((r) => r.path === '/')
    .children.find((r) => r.path === parentRoutePath)
  return parentRoute ? parentRoute.children || [] : []
})

// 路由跳转后，更新选中的菜单项
router.afterEach((to) => {
  updateSelectedKeys(to.path)
})

const updateSelectedKeys = (path) => {
  selectedKeys.value = path
}

// 初始化选中项
onMounted(() => {
  updateSelectedKeys(route.path)
})

const doMenuItemClick = (key) => {
  router.push(key)
}
</script>

<style scoped>
#admin {
  display: flex; /* 使用 flex 布局 */
  box-sizing: border-box;
}

.menu-admin {
  flex-shrink: 0; /* 防止菜单缩小 */
  height: 50%;
}

.adminContent {
  height: 100%;
  padding: 20px;
  overflow: auto;
  box-sizing: border-box;
}

.menu-admin .arco-menu {
  width: 200px;
  height: 100%; /* 设置菜单高度为父容器高度 */
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
}

.menu-admin .arco-menu :deep(.arco-menu-collapse-button) {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.menu-admin .arco-menu:not(.arco-menu-collapsed) :deep(.arco-menu-collapse-button) {
  right: 0;
  bottom: 8px;
  transform: translateX(50%);
}

.menu-admin .arco-menu:not(.arco-menu-collapsed)::before {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  width: 48px;
  height: 48px;
  background-color: inherit;
  border-radius: 50%;
  box-shadow:
    -4px 0 2px var(--color-bg-2),
    0 0 1px rgba(0, 0, 0, 0.3);
  transform: translateX(50%);
}

.menu-admin .arco-menu.arco-menu-collapsed {
  width: 48px;
  height: auto;
  padding-top: 24px;
  padding-bottom: 138px;
  border-radius: 22px;
}

.menu-admin .arco-menu.arco-menu-collapsed :deep(.arco-menu-collapse-button) {
  right: 8px;
  bottom: 8px;
}
</style>
