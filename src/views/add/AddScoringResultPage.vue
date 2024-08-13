<template>
  <div id="AddScoringResultPage">
    <div class="AddScoringResult">
      <h2>创建评分结果</h2>
      <!--      {{ form }}-->
      <a-form
        :model="form"
        :rules="rules"
        label-align="left"
        auto-label-width
        @submit-success="handleSubmit"
      >
        <a-form-item label="应用id">
          {{ appId }}
        </a-form-item>
        <a-form-item v-if="updateId" label="修改评分 id">
          {{ updateId }}
        </a-form-item>
        <a-form-item field="resultName" label="结果名称" :rules="rules.resultName">
          <a-textarea
            allow-clear
            v-model="form.resultName"
            placeholder="请输入结果名称"
            auto-size
          />
        </a-form-item>
        <a-form-item field="resultDesc" label="结果描述" :rules="rules.resultDesc">
          <a-textarea
            allow-clear
            v-model="form.resultDesc"
            placeholder="请输入结果描述"
            auto-size
          />
        </a-form-item>
        <a-form-item field="resultPicture" label="结果图标">
          <!--          <a-input allow-clear v-model="form.resultPicture" placeholder="请输入结果图标" />-->
          <ImageUpload biz="resultPicture" :on-change="doChange" :value="form.resultPicture" />
        </a-form-item>
        <a-form-item
          v-if="appType === 1"
          field="appType"
          label="结果集"
          :help="form.resultProp && form.resultProp[0] ? '' : '不能为空'"
          :validate-status="form.resultProp && form.resultProp[0] ? 'success' : 'error'"
        >
          <a-input-tag
            v-model="form.resultProp"
            placeholder="请输出结果集，按回车确认"
            allow-clear
          />
        </a-form-item>
        <a-form-item
          v-else
          field="resultScoreRange"
          label="评分范围"
          :rules="rules.resultScoreRange"
        >
          <a-input-number v-model="form.resultScoreRange" placeholder="请输入评分范围" />
        </a-form-item>
        <a-form-item>
          <div class="login-button">
            <a-button type="primary" html-type="submit"> 提交 </a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>
    <div class="ScoringResultList">
      <ScoringResultListTable :appId="appId" :doUpdate="doUpdate" ref="tableRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref, toRefs, watchEffect, withDefaults } from 'vue'
import API from '@/api'
import { useUnsavedChangesStore } from '@/store/unsavedChangesStore'
import { getAppVoByIdUsingGet } from '@/api/appController'
import message from '@arco-design/web-vue/es/message'
import ScoringResultListTable from '@/views/add/components/ScoringResultListTable.vue'
import {
  addScoringResultUsingPost,
  editScoringResultUsingPost
} from '@/api/scoringResultController'
import ImageUpload from '@/components/ImageUpload.vue'

const props = withDefaults(defineProps<{ appId: string }>(), {
  appId: () => ''
})
const { appId } = toRefs(props)

// 表单参数
const form = ref({
  resultDesc: '',
  resultName: '',
  resultPicture: ''
} as API.ScoringResultAddRequest)

const rules = ref({
  resultName: [
    { required: true, message: '结果名称不能为空', trigger: 'blur' },
    { minLength: 3, maxLength: 100, message: '结果名称长度需在3到100个字符之间', trigger: 'blur' }
  ],
  resultDesc: [
    { required: true, message: '结果描述不能为空', trigger: 'blur' },
    { minLength: 3, maxLength: 500, message: '结果描述长度需在10到500个字符之间', trigger: 'blur' }
  ],
  resultProp: [{ type: 'tag', message: '结果集不能为空', trigger: 'blur' }],
  resultScoreRange: [
    { required: true, type: 'number', message: '评分范围不能为空', trigger: 'blur' },
    { type: 'number', minLength: 0, message: '评分范围不能为负数', trigger: 'blur' }
  ]
} as any)

const initialForm = ref<API.AppAddRequest>() // 保存初始加载的数据
const unsavedChangesStore = useUnsavedChangesStore()
const tableRef = ref<any>()

const appType = ref<number>() // 确保 appType 是 number 类型或 null
const updateId = ref<any>()

//获取图片url
const doChange = (url: any) => {
  form.value.resultPicture = url
}

/**
 * 获取应用类型
 */
const loadAppType = async () => {
  const res = await getAppVoByIdUsingGet({
    id: appId.value as any
  })
  if (res.data.code === 0) {
    appType.value = res.data.data?.appType
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}
/**
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  unsavedChangesStore.setUnsavedChanges(
    JSON.stringify(form.value) !== JSON.stringify(initialForm.value)
  )
})

onMounted(() => {
  unsavedChangesStore.setUnsavedChanges(false)
  loadAppType()
})

const doUpdate = (result: API.ScoringResultVO) => {
  updateId.value = result.id
  form.value = result
  initialForm.value = JSON.parse(JSON.stringify(form.value)) // 深拷贝当前数据为初始数据
}
/**
 * 提交数据
 */
const handleSubmit = async () => {
  if (!props.appId) {
    return
  }
  let res: any
  // 如果是修改
  if (updateId.value) {
    res = await editScoringResultUsingPost({
      id: updateId.value as any,
      ...form.value
    })
  } else {
    // 创建
    res = await addScoringResultUsingPost({
      appId: props.appId as any,
      ...form.value
    })
  }
  if (res.data.code === 0) {
    message.success('操作成功')
    form.value = {
      resultDesc: '',
      resultName: '',
      resultPicture: ''
    }
    initialForm.value = JSON.parse(JSON.stringify(form.value)) // 深拷贝当前数据为初始数据
  } else {
    message.error('操作失败，' + res.data.message)
  }
  if (tableRef.value) {
    await tableRef.value.loadData()
    updateId.value = undefined
  }
}

// 处理浏览器的返回和刷新
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  const hasUnsavedChanges = JSON.stringify(form.value) !== JSON.stringify(initialForm.value)
  if (hasUnsavedChanges) {
    event.preventDefault()
    event.returnValue = '' // 这是现代浏览器所需的
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.AddScoringResult {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: right; /* 垂直居中 */
  min-height: 40vh; /* 调整高度以适应更多内容 */
  width: 100%;
  max-width: 500px; /* 调整最大宽度以适应不同设备 */
  padding: 20px;
}

h2 {
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
}

.form-container {
  width: 100%;
}

.a-form-item {
  margin-bottom: 20px; /* 增加表单项之间的间距 */
}

.a-input,
.a-select,
.a-textarea {
  width: 100%; /* 设置输入框、选择框和文本域宽度一致 */
}

.login-button {
  width: 100%;
  text-align: center;
}

.login-button .a-button {
  width: 100%; /* 按钮宽度 */
  max-width: 150px;
}

@media (max-width: 480px) {
  #AddAppPage {
    width: 90%; /* 小屏幕设备上的宽度 */
    padding: 10px; /* 减小内边距 */
  }
}
</style>
