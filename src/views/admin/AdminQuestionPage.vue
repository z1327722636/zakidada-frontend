<template>
  <a-form
    :model="formSearchParams"
    :style="{ marginBottom: '20px' }"
    layout="inline"
    @submit="doSearch"
  >
    <a-form-item field="appId" label="应用 id" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
      <a-input v-model="formSearchParams.appId" placeholder="请输入应用 id" allow-clear />
    </a-form-item>
    <a-form-item field="userId" label="用户 id" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
      <a-input v-model="formSearchParams.userId" placeholder="请输入用户 id" allow-clear />
    </a-form-item>
    <a-form-item :wrapperCol="{ offset: 4, span: 20 }">
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
      total
    }"
    @page-change="onPageChange"
  >
    <template #questionContent="{ record }">
      <div v-for="question in parseQuestionContent(record.questionContent)" :key="question.title">
        <a-popover position="rt" title="option">
          <span>
            <strong>{{ question.title }}</strong>
          </span>
          <template #content>
            <p v-for="option in question.options">
              {{ option.key }}、{{ option.value }} | {{ displayOption(option) }}
            </p>
          </template>
        </a-popover>
      </div>
    </template>
    <template #createTime="{ record }">
      {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
    </template>
    <template #updateTime="{ record }">
      {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
    </template>
    <template #optional="{ record }">
      <a-space>
        <a-button type="primary" icon="icon-delete" @click="doDelete(record)">删除</a-button>
      </a-space>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { deleteQuestionUsingPost, listQuestionByPageUsingPost } from '@/api/questionController'
import API from '@/api'
import message from '@arco-design/web-vue/es/message'
import { dayjs } from '@arco-design/web-vue/es/_utils/date'

const formSearchParams = ref<API.QuestionQueryRequest>({})

// 初始化搜索条件（不应该被修改）
const initSearchParams = {
  current: 1,
  pageSize: 10
}

const searchParams = ref<API.QuestionQueryRequest>({
  ...initSearchParams,
  sortField: 'updateTime',
  sortOrder: 'descend'
})
const dataList = ref<API.Question[]>([])
const total = ref<number>(0)

/**
 * 加载数据
 */
const loadData = async () => {
  const res = await listQuestionByPageUsingPost(searchParams.value)
  if (res.data.code === 0) {
    dataList.value = res.data.data?.records || []
    total.value = res.data.data?.total || 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}
/**
 * 显示题目选项
 * @param option
 * @returns {String}
 */
const displayOption = (option) => {
  return option.result ? `${option.result}型` : `${option.score}分`
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
 * 当分页变化时，改变搜索条件，触发数据加载
 * @param page
 */
const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page
  }
}

/**
 * 解析题目内容
 * @param content
 * @returns {Array}
 */
const parseQuestionContent = (content) => {
  try {
    return JSON.parse(content)
  } catch (error) {
    return []
  }
}

/**
 * 删除
 * @param record
 */
const doDelete = async (record: API.Question) => {
  if (!record.id) {
    return
  }

  const res = await deleteQuestionUsingPost({
    id: record.id
  })
  if (res.data.code === 0) {
    loadData()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}

/**
 * 监听 searchParams 变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  loadData()
})

// 表格列配置
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    ellipsis: true,
    tooltip: true,
    width: 80
  },
  {
    title: '题目内容',
    dataIndex: 'questionContent',
    slotName: 'questionContent',
    ellipsis: true,
    tooltip: true,
    width: 200
  },
  {
    title: '应用 id',
    dataIndex: 'appId',
    ellipsis: true,
    tooltip: true,
    width: 50
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    ellipsis: true,
    tooltip: true,
    width: 50
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
    width: 100
  }
]
</script>
