<template>
  <div id="AdminAppPage">
    <!-- 表单搜索 -->
    <a-form
      :model="formSearchParams"
      :style="{ marginBottom: '20px' }"
      layout="inline"
      @submit="doSearch"
    >
      <a-form-item field="appName" label="应用名称">
        <a-input v-model="formSearchParams.appName" placeholder="请输入应用名称" allow-clear />
      </a-form-item>
      <a-form-item field="appDesc" label="应用描述">
        <a-input v-model="formSearchParams.appDesc" placeholder="请输入应用描述" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100px"> 搜索 </a-button>
      </a-form-item>
    </a-form>

    <!-- 表格展示 -->
    <a-table
      :columns="columns"
      :data="dataList"
      @page-change="onPageChange"
      :pagination="{
        showTotal: true,
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total: totalPage
      }"
    >
      <template #appIcon="{ record }">
        <a-image width="64" :src="record.appIcon" />
      </template>
      <template #appType="{ record }">
        {{ APP_TYPE_MAP[record.appType as 0 | 1] }}
      </template>
      <template #scoringStrategy="{ record }">
        {{ APP_SCORING_STRATEGY_MAP[record.scoringStrategy as 0 | 1] }}
      </template>
      <template #reviewStatus="{ record }">
        {{ REVIEW_STATUS_MAP[record.reviewStatus as 0 | 1 | 2] }}
      </template>
      <template #reviewTime="{ record }">
        {{ record.reviewTime && dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template #createTime="{ record }">
        {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template #updateTime="{ record }">
        {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template #optional="{ record }">
        <a-space>
          <a-button
            v-if="record.reviewStatus !== REVIEW_STATUS_ENUM.PASS"
            status="success"
            @click="doReview(record, REVIEW_STATUS_ENUM.PASS, '')"
          >
            通过
          </a-button>
          <a-button
            v-if="record.reviewStatus !== REVIEW_STATUS_ENUM.REJECT"
            status="warning"
            @click="doReview(record, REVIEW_STATUS_ENUM.REJECT, '不符合上架要求')"
          >
            拒绝
          </a-button>
          <a-button status="danger" @click="doDelete(record)">删除</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import API from '@/api'
import message from '@arco-design/web-vue/es/message'
import { dayjs } from '@arco-design/web-vue/es/_utils/date'
import {
  deleteAppUsingPost,
  doAppReviewUsingPost,
  listAppByPageUsingPost
} from '@/api/appController'
import {
  APP_SCORING_STRATEGY_MAP,
  APP_TYPE_MAP,
  REVIEW_STATUS_ENUM,
  REVIEW_STATUS_MAP
} from '@/constant/app'

// 定义数据
const dataList = ref<API.App[]>([])
const totalPage = ref<number>(0)
const loading = ref(false)
const initSearchParams = {
  current: 1,
  pageSize: 10
}
const searchParams = ref<API.AppQueryRequest>({
  ...initSearchParams,
  sortField: 'updateTime',
  sortOrder: 'descend'
})
const formSearchParams = ref<API.AppQueryRequest>({})

/**
 * 数据渲染
 */
const loadData = async () => {
  loading.value = true
  try {
    const response = await listAppByPageUsingPost(searchParams.value)
    if (response.data.code === 0) {
      dataList.value = response.data.data?.records || []
      totalPage.value = response.data.data?.total || 0
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
 * 执行搜索
 */
const doSearch = () => {
  searchParams.value = {
    ...initSearchParams,
    ...formSearchParams.value
  }
}
/**
 * 删除
 * @param record
 */
const doDelete = async (record: API.App) => {
  if (!record.id) {
    return
  }
  try {
    const res = await deleteAppUsingPost({
      id: record.id
    })
    if (res.data.code === 0) {
      message.success('删除成功')
      await loadData()
    } else {
      message.error('删除失败，' + res.data.message)
    }
  } catch (error) {
    message.error('网络错误，无法删除')
  }
}

/**
 * 审核
 * @param record
 * @param reviewStatus
 * @param reviewMessage
 */
const doReview = async (record: API.App, reviewStatus: number, reviewMessage?: string) => {
  if (!record.id) {
    return
  }

  const res = await doAppReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage
  })
  if (res.data.code === 0) {
    loadData()
  } else {
    message.error('审核失败，' + res.data.message)
  }
}
/**
 *监听数据变化更新渲染
 */
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
    width: 50
  },
  {
    title: '名称',
    dataIndex: 'appName',
    ellipsis: true,
    tooltip: true,
    width: 150
  },
  {
    title: '描述',
    dataIndex: 'appDesc',
    ellipsis: true,
    tooltip: true,
    width: 200
  },
  {
    title: '图标',
    dataIndex: 'appIcon',
    slotName: 'appIcon',
    width: 100
  },
  {
    title: '应用类型',
    dataIndex: 'appType',
    slotName: 'appType',
    width: 100
  },
  {
    title: '评分策略',
    dataIndex: 'scoringStrategy',
    slotName: 'scoringStrategy',
    width: 100
  },
  {
    title: '审核状态',
    dataIndex: 'reviewStatus',
    slotName: 'reviewStatus',
    width: 100
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '审核时间',
    dataIndex: 'reviewTime',
    slotName: 'reviewTime',
    ellipsis: true,
    tooltip: true,
    width: 110
  },
  {
    title: '审核人 ID',
    dataIndex: 'reviewerId',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '用户 ID',
    dataIndex: 'userId',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    ellipsis: true,
    tooltip: true,
    width: 110
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    slotName: 'updateTime',
    ellipsis: true,
    tooltip: true,
    width: 110
  },
  {
    title: '操作',
    slotName: 'optional',
    width: '250'
  }
] as any[]
</script>

<style scoped></style>
