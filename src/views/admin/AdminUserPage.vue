<template>
  <div id="AdminUserPage">
    <a-form
      :model="formSearchParams"
      :style="{ marginBottom: '20px' }"
      layout="inline"
      @submit="doSearch"
    >
      <a-form-item field="userAccount" label="账号">
        <a-input allow-clear v-model="formSearchParams.userAccount" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item field="userName" label="用户名">
        <a-input allow-clear v-model="formSearchParams.userName" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item field="userProfile" label="用户简介">
        <a-input allow-clear v-model="formSearchParams.userProfile" placeholder="请输入用户简介" />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100px"> 搜索</a-button>
      </a-form-item>
    </a-form>

      <a-table
        :columns="columns"
        :data="dataList"
        :pagination="{
          showTotal: true,
          pageSize: searchParams.pageSize,
          current: searchParams.current,
          total: totalPage,
          onChange: onPageChange
        }"
      >
        <template #userAvatar="{ record }">
          <a-image width="64" :src="record.userAvatar" />
        </template>
        <template #createTime="{ record }">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template #updateTime="{ record }">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template #optional="{ record }">
          <a-space>
            <a-button status="danger" @click="doDelete(record)">删除</a-button>
          </a-space>
        </template>
      </a-table>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import API from '@/api'
import { deleteUserUsingPost, listUserByPageUsingPost } from '@/api/userController'
import message from '@arco-design/web-vue/es/message'
import { dayjs } from '@arco-design/web-vue/es/_utils/date'

const dataList = ref<API.User[]>([])
const totalPage = ref<number>(0)
const loading = ref(false)
const initSearchParams = {
  current: 1,
  pageSize: 10
}
const searchParams = ref<API.UserQueryRequest>({
  ...initSearchParams,
  sortField: "updateTime",
  sortOrder: "descend",
})
const formSearchParams = ref<API.UserQueryRequest>({})

/**
 * 数据渲染
 */
const loadData = async () => {
  loading.value = true
  try {
    const response = await listUserByPageUsingPost(searchParams.value)
    if (response.data.code === 0) {
      dataList.value = response.data.data?.records || []
      totalPage.value = response.data.data?.total || 0
    } else {
      message.error('获取用户信息失败' + response.data.message)
    }
  } catch (error) {
    message.error('网络错误，无法获取用户信息')
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
 * 执行搜索
 */
const doSearch = () => {
  searchParams.value = {
    ...initSearchParams,
    ...formSearchParams.value
  }
}

const doDelete = async (record: API.User) => {
  if (!record.id) {
    return
  }
  try {
    const res = await deleteUserUsingPost({
      id: record.id
    })
    if (res.data.code === 0) {
      message.success('删除成功')
      await loadData()
    } else {
      message.error('删除失败，' + res.data.message)
    }
  } catch (error) {
    message.error('网络错误，无法删除用户')
  }
}

watchEffect(() => {
  loadData()
})

// 表格列配置
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    ellipsis: true,
    tooltip: true,
    width: 50,
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    ellipsis: true,
    tooltip: true,
    width: 100,
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    ellipsis: true,
    tooltip: true,
    width: 100,
  },
  {
    title: '用户头像',
    dataIndex: 'userAvatar',
    slotName: 'userAvatar',
    ellipsis: true,
    tooltip: true,
    width: 150,
  },
  {
    title: '用户简介',
    dataIndex: 'userProfile',
    ellipsis: true,
    tooltip: true,
    width: 200,
  },
  {
    title: '权限',
    dataIndex: 'userRole',
    ellipsis: true,
    tooltip: true,
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    ellipsis: true,
    tooltip: true,
    width: 150,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    slotName: 'updateTime',
    ellipsis: true,
    tooltip: true,
    width: 150,
  },
  {
    title: '操作',
    slotName: 'optional',
    ellipsis: true,
    tooltip: true,
    width: 150,
  }
]
</script>

<style scoped>
/* 样式优化 */
#AdminUserPage {
  width: auto;
}
</style>
