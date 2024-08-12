<template>
  <div id="home">
    <div class="searchBar">
      <a-input-search
        :style="{ width: '320px' }"
        placeholder="快速发现答题应用"
        size="large"
        search-button
        @search="onSearch"
        v-model="inputSearchParams.searchText"
      />
    </div>

    <a-list
      class="list-demo-action-layout"
      :grid-props="{ gutter: [20, 20], sm: 24, md: 12, lg: 8, xl: 6 }"
      :bordered="false"
      :data="dataList"
      :pagination-props="{
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total
      }"
      @page-change="onPageChange"
    >
      <template #item="{ item }">
        <AppCard :app="item" />
      </template>
    </a-list>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppCard from '@/components/AppCard.vue'
import API from '@/api'
import { listAppVoByPageUsingPost } from '@/api/appController'
import message from '@arco-design/web-vue/es/message'
import { REVIEW_STATUS_ENUM } from '@/constant/app'

const dataList = ref<API.AppVO[]>([])
const total = ref<number>(0)
const loading = ref(false)
const initSearchParams = {
  current: 1,
  pageSize: 12
}
const searchParams = ref<API.AppQueryRequest>({
  ...initSearchParams
})

const inputSearchParams = ref<API.AppQueryRequest>({
  searchText: ''
})
/**
 * 数据渲染
 */
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      reviewStatus: REVIEW_STATUS_ENUM.PASS,
      ...searchParams.value
    }
    const response = await listAppVoByPageUsingPost(params)
    if (response.data.code === 0) {
      dataList.value = response.data.data?.records || []
      total.value = response.data.data?.total || 0
    } else {
      message.error('获取应用信息失败' + response.data.message)
    }
  } catch (error) {
    message.error('网络错误，无法获取应用信息')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

/**
 * 当分页变化时，改变搜索条件，触发数据加载
 * @param page
 */
const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page
  }
  loadData()
}

/**
 * 页面搜索
 */
const onSearch = () => {
  searchParams.value = {
    ...searchParams.value,
    ...inputSearchParams.value
  }
  loadData()
}
</script>
<style scoped>
#home {
  width: 100%;
}

.searchBar {
  text-align: center;
  margin-bottom: 14px;
}

.list-demo-action-layout {
  text-align: center;
  margin-top: 14px;
  padding: 14px;
}

.list-demo-action-layout .image-area {
  width: 183px;
  height: 119px;
  border-radius: 2px;
  overflow: hidden;
}

.list-demo-action-layout .list-demo-item {
  padding: 20px 0;
  border-bottom: 1px solid var(--color-fill-3);
}

.list-demo-action-layout .image-area img {
  width: 100%;
}

.list-demo-action-layout .arco-list-item-action .arco-icon {
  margin: 0 4px;
}
</style>
