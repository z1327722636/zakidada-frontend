<template>
  <div id="global-header">
    <a-space direction="vertical" :size="16" style="display: block">
      <a-row class="grid-demo" :wrap="false">
        <a-col flex="auto">
          <a-menu
            mode="horizontal"
            :selected-keys="[selectedKeys]"
            @menu-item-click="doMenuItemClick"
          >
            <a-menu-item key="0" :style="{ padding: 0, marginRight: '38px' }" disabled>
              <div class="logo no-caret" @click="handleLogoClick">
                <img src="../assets/logo.png" alt="logo" />
                <span class="title">zakidada</span>
              </div>
            </a-menu-item>
            <template v-for="item in visibleRoutes">
              <a-sub-menu v-if="item.children" :key="item.path" :title="item.name">
                <a-menu-item
                  v-for="subItem in item.children"
                  :key="subItem.path"
                  :path="subItem.path"
                >
                  {{ subItem.name }}
                </a-menu-item>
              </a-sub-menu>
              <a-menu-item v-else :key="item.path" :path="item.path">
                {{ item.name }}
              </a-menu-item>
            </template>
          </a-menu>
        </a-col>
        <a-col flex="100px">
          <div v-if="loginUserStore.loginUser.id">
            <a-popover position="bottom" :content-style="{ width: '100px',padding: '10px 0' }">
              <a-avatar class="avatar" @click="router.push('/my')">
                <img
                  v-if="loginUserStore.loginUser.userAvatar"
                  alt="avatar"
                  :src="loginUserStore.loginUser.userAvatar"
                />
                <span v-else>{{ loginUserStore.loginUser.userName??"匿名" }}</span>
              </a-avatar>
              <template #content>
                  <li>
                    <div @click="router.push('/my')">个人中心</div>
                  </li>
<!--                  <li>-->
<!--                    <div  @click="router.push('/user')">设置</div>-->
<!--                  </li>-->
                  <li>
                    <div  @click="loginUserStore.clearLoginUser">退出登录</div>
                  </li>
              </template>
            </a-popover>
          </div>
          <div v-else><a-button type="primary" @click="router.push('/user')">登录</a-button></div>
        </a-col>
      </a-row>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { routes } from '@/router/routes'
import { useRoute, useRouter } from 'vue-router'
import { computed, defineProps, onMounted, ref } from 'vue'
import { useLoginUserStore } from '@/store/userStore'
import checkAccess from '@/access/checkAccess'
import { useUnsavedChangesStore } from '@/store/unsavedChangesStore'

const props = defineProps<{
  parentPath?: string
}>()

const router = useRouter()
const route = useRoute()
const selectedKeys = ref(route.path) // 初始化为当前路径
const loginUserStore = useLoginUserStore()
const unsavedChangesStore = useUnsavedChangesStore()

// 路由跳转后，更新选中的菜单项
router.afterEach((to) => {
  selectedKeys.value = to.path
})

const handleLogoClick = () => {
  if (unsavedChangesStore.checkUnsavedChanges()) {
    router.push('/')
  }
}

const doMenuItemClick = (key: string) => {
  if (unsavedChangesStore.checkUnsavedChanges()) {
    router.push(key)
  } else {
    // 阻止导航栏高亮变化
    selectedKeys.value = route.path
    e.preventDefault()
  }
}

// 动态计算当前路由的子路由数组
const currentChildrenRoutes = computed(() => {
  // 使用传递的父路由路径或默认为 `/`
  const parentRoutePath = props.parentPath || '/'
  const parentRoute = routes.find((r) => r.path === parentRoutePath)
  return parentRoute ? parentRoute.children || [] : []
})

// 展示在菜单的路由数组
const visibleRoutes = computed(() => {
  return currentChildrenRoutes.value.filter((item) => {
    if (item.meta?.hideInMenu) {
      return false
    }
    // 根据权限过滤菜单
    return checkAccess(loginUserStore.loginUser, item.meta?.access as string);
  })
})

// 当组件挂载时，设置默认选中的菜单项
onMounted(() => {
  if (visibleRoutes.value.length > 0 && selectedKeys.value === '/') {
    selectedKeys.value = visibleRoutes.value[0].path
    router.push(visibleRoutes.value[0].path)
  }
})
</script>

<style scoped>
#global-header {
  height: 64px;
  line-height: 64px;
  background: var(--color-bg-1);
  padding: 0 50px;
  position: relative;
  z-index: 1;
  box-shadow: #eee 1px 1px 5px;
}


/* 菜单项的样式 */
 li {
   margin: 0;
  list-style-type: none; /* 去掉列表项的默认样式 */
  padding: 8px 16px; /* 内边距 */
  cursor: pointer; /* 鼠标指针样式 */
  transition: background-color 0.3s ease; /* 背景颜色变化的过渡效果 */
}

 li:hover {
  background-color: #f0f0f0; /* 鼠标悬停时的背景颜色*/
}
.avatar{
  cursor: pointer;
}
/* 菜单项中包含的文本的样式 */
 li div {
  color: #333; /* 文本颜色 */
  text-align: left; /* 文本左对齐 */
}
.logo {
  display: flex;
  cursor: pointer;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #fecbfd;
}

.logo img {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.no-caret {
  user-select: none;
  /* 禁用文本选择 */
}
</style>
