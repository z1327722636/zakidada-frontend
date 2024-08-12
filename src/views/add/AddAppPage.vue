<template>
  <div id="AddAppPage">
    <h2 v-if="id">修改应用</h2>
    <h2 v-else>创建应用</h2>
    <a-form
      :model="form"
      :rules="rules"
      layout="vertical"
      @submit-success="handleSubmit"
      class="form-container"
    >
      <a-form-item field="appName" label="应用名称" :rules="rules.appName">
        <a-input allow-clear v-model="form.appName" placeholder="请输入应用名称" />
      </a-form-item>
      <a-form-item field="appDesc" label="应用描述" :rules="rules.appDesc">
        <a-textarea allow-clear v-model="form.appDesc" placeholder="请输入应用描述" auto-size />
      </a-form-item>
      <a-form-item field="appIcon" label="应用图标" :rules="rules.appIcon">
        <a-input allow-clear v-model="form.appIcon" placeholder="请输入应用图标" />
      </a-form-item>
      <a-form-item field="appType" label="应用类型" :rules="rules.appType">
        <a-select v-model="form.appType" placeholder="请选择应用类型">
          <a-option v-for="(value, key) of APP_TYPE_MAP" :value="Number(key)" :label="value" />
        </a-select>
      </a-form-item>
      <a-form-item field="scoringStrategy" label="评分策略" :rules="rules.scoringStrategy">
        <a-select v-model="form.scoringStrategy" placeholder="请选择评分策略">
          <a-option
            v-for="(value, key) of APP_SCORING_STRATEGY_MAP"
            :value="Number(key)"
            :label="value"
          />
        </a-select>
      </a-form-item>
      <a-form-item>
        <div class="login-button">
          <a-button type="primary" html-type="submit"> 提交 </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, toRefs, watchEffect } from 'vue'
import API from '@/api'
import { useRouter } from 'vue-router'
import message from '@arco-design/web-vue/es/message'
import { addAppUsingPost, editAppUsingPost, getAppVoByIdUsingGet } from '@/api/appController'
import { APP_SCORING_STRATEGY_MAP, APP_TYPE_MAP } from '@/constant/app'
import { useUnsavedChangesStore } from '@/store/unsavedChangesStore'

const router = useRouter()
const props = withDefaults(defineProps<{ id: String }>(), {
  id: () => ''
})
const { id } = toRefs(props) // 使用 toRefs 将 props 转换为 ref

const form = ref({
  appDesc: '',
  appIcon: '',
  appName: '',
  appType: 0,
  scoringStrategy: 0
} as API.AppAddRequest)

const rules = ref({
  appName: [
    { required: true, message: '应用名称不能为空', trigger: 'blur' },
    { minLength: 1, maxLength: 50, message: '应用名称长度需在3到50个字符之间', trigger: 'blur' }
  ],
  appDesc: [
    { required: true, message: '应用描述不能为空', trigger: 'blur' },
    { minLength: 1, maxLength: 200, message: '应用描述长度需在5到200个字符之间', trigger: 'blur' }
  ],
  appIcon: [
    {
      type: 'url'
    }
  ],
  appType: [{ required: true, message: '请选择应用类型', trigger: 'change' }],
  scoringStrategy: [{ required: true, message: '请选择评分策略', trigger: 'change' }]
})

const oldApp = ref<API.AppVO>()
const initialForm = ref<API.AppAddRequest>() // 保存初始加载的数据
const unsavedChangesStore = useUnsavedChangesStore()

/**
 * 数据渲染
 */
const loadData = async () => {
  if (!id.value) {
    return
  }
  const res = await getAppVoByIdUsingGet({
    id: id.value as any
  })
  if (res.data.code === 0) {
    oldApp.value = res.data.data
    form.value = res.data.data
    initialForm.value = JSON.parse(JSON.stringify(form.value)) // 深拷贝初始数据
    unsavedChangesStore.setUnsavedChanges(false)
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
  loadData()
  unsavedChangesStore.setUnsavedChanges(false)
})

/**
 * 提交数据
 */
const handleSubmit = async () => {
  if (id.value) {
    const response = await editAppUsingPost({ id: id.value as any, ...form.value })
    if (response.data.code === 0) {
      message.success('修改成功')
      initialForm.value = JSON.parse(JSON.stringify(form.value)) // 深拷贝当前数据为初始数据
      unsavedChangesStore.setUnsavedChanges(false)
      setTimeout(() => {
        router.push(`/app/detail/${props.id}`)
      }, 3000)
    } else {
      message.error('修改失败，' + response.data.message)
    }
  } else {
    const response = await addAppUsingPost(form.value)
    if (response.data.code === 0) {
      message.success('创建成功')
      unsavedChangesStore.setUnsavedChanges(false)
      setTimeout(() => {
        router.push(`/app/detail/${response.data.data}`)
      }, 3000)
    } else {
      message.error('创建失败，' + response.data.message)
    }
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
#AddAppPage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 垂直居中 */
  min-height: 70vh; /* 调整高度以适应更多内容 */
  width: 100%;
  max-width: 600px; /* 调整最大宽度以适应不同设备 */
  padding: 20px;
  margin: 0 auto;
  background: #f9f9f9; /* 背景颜色 */
  border-radius: 10px; /* 圆角边框 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 阴影效果 */
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
