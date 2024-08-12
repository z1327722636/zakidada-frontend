<template>
  <div id="AddQuestionPage">
    <h2>设置题目</h2>
    <a-form
      :model="questionContent"
      :style="{ width: '800px' }"
      label-align="left"
      auto-label-width
      @submit-success="handleSubmit"
    >
      <a-popover position="lt" title="详细信息">
        <span>
          <strong>
            <a-form-item label="应用id"> {{ appId }}</a-form-item></strong
          >
        </span>
        <template #content>
          <a-form-item label="应用名称" field="appName">
            {{ appVO?.appName }}
          </a-form-item>
          <a-form-item label="应用描述" field="appDesc">
            {{ appVO?.appDesc }}
          </a-form-item>
          <a-form-item label="应用类型" field="appType">
            {{ APP_TYPE_MAP[appVO?.appType] }}
          </a-form-item>
        </template>
      </a-popover>

      <a-form-item label="题目列表" :content-flex="false" :merge-props="false">
        <a-space size="large">
          <a-button @click="addQuestion(questionContent.length)"> 底部添加题目 </a-button>
          <AiGenerateQuestionDrawer
            :appId="appId"
            :upQuestionDate="upQuestionDate"
            :appVO="appVO"
            :onSSESuccess="onSSESuccess"
            :onSSEStart="onSSEStart"
            :onSSEClose="onSSEClose"
          />
          <a-button size="small" @click="toggleAllCollapse">
            {{ isCollapseStates ? '展开' : '收起' }}
          </a-button>
        </a-space>
        <div class="question" v-for="(question, qIndex) in questionContent" :key="qIndex">
          <a-space size="large">
            <h3 class="no-wrap">题目{{ qIndex + 1 }}:</h3>
            {{ question.title }}
            <a-button size="small" @click="addQuestion(qIndex + 1)"> 此题后添加 </a-button>
            <a-button
              size="small"
              status="danger"
              @click="deleteQuestion(qIndex)"
              :disabled="questionContent.length === 1"
            >
              删除该题目
            </a-button>
            <a-button size="small" @click="toggleCollapse(qIndex)">
              {{ collapseStates[qIndex] ? '展开' : '收起' }}
            </a-button>
          </a-space>
          <a-collapse v-show="!collapseStates[qIndex]" class="question-collapse">
            <a-form-item
              :label="`题目${qIndex + 1} 标题`"
              :field="`title${qIndex}`"
              :help="question.title && question.title !== '' ? '' : '不能为空'"
              :validate-status="question.title && question.title !== '' ? 'success' : 'error'"
            >
              <a-input v-model="question.title" placeholder="请输入标题" />
            </a-form-item>
            <a-space size="large">
              <h4 class="no-wrap">题目{{ qIndex + 1 }} 选项列表</h4>
              <a-button size="small" @click="addQuestionOption(qIndex, question.options.length)">
                底部添加选项
              </a-button>
            </a-space>
            <a-collapse class="option-collapse">
              <div v-for="(option, oIndex) in question.options" :key="oIndex">
                <a-space size="large">
                  <h5 class="no-wrap">选项 {{ oIndex + 1 }}:</h5>
                  {{ option.value }}
                  <a-button size="mini" @click="addQuestionOption(qIndex, oIndex + 1)">
                    此选项后添加
                  </a-button>
                  <a-button
                    size="mini"
                    status="danger"
                    @click="deleteQuestionOption(qIndex, oIndex)"
                    :disabled="question.options.length === 1"
                  >
                    删除该选项
                  </a-button>
                  <a-button size="small" @click="toggleOptionCollapse(qIndex, oIndex)">
                    {{ optionCollapseStates[qIndex][oIndex] ? '展开' : '收起' }}
                  </a-button>
                </a-space>
                <a-collapse
                  v-show="optionCollapseStates[qIndex] && !optionCollapseStates[qIndex][oIndex]"
                  class="option-details"
                >
                  <a-form-item
                    :label="`选项 ${oIndex + 1} key`"
                    :field="`optionKey_${qIndex}_${oIndex}`"
                    :help="option.key && option.key !== '' ? '' : '不能为空'"
                    :validate-status="option.key && option.key !== '' ? 'success' : 'error'"
                  >
                    <a-input v-model="option.key" placeholder="请输入选项 key" />
                  </a-form-item>
                  <a-form-item
                    :label="`选项${oIndex + 1} `"
                    :field="`optionValue_${qIndex}_${oIndex}`"
                    :help="option.value && option.value !== '' ? '' : '不能为空'"
                    :validate-status="option.value && option.value !== '' ? 'success' : 'error'"
                  >
                    <a-input v-model="option.value" placeholder="请输入选项值" />
                  </a-form-item>
                  <a-form-item
                    v-if="appType === 1"
                    :label="`选项${oIndex + 1} 结果`"
                    :field="`optionResult_${qIndex}_${oIndex}`"
                    :help="option.result && option.result !== '' ? '' : '不能为空'"
                    :validate-status="option.result && option.result !== '' ? 'success' : 'error'"
                  >
                    <a-input v-model="option.result" placeholder="请输入选项结果" />
                  </a-form-item>
                  <a-form-item
                    v-else
                    :label="`选项 ${oIndex + 1} 得分`"
                    :field="`optionScore_${qIndex}_${oIndex}`"
                    :help="option.score !== undefined ? '' : '不能为空'"
                    :validate-status="option.score !== undefined ? 'success' : 'error'"
                  >
                    <a-input-number v-model="option.score" placeholder="请输入选项得分" />
                  </a-form-item>
                </a-collapse>
              </div>
            </a-collapse>
          </a-collapse>
        </div>
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
import { defineProps, onMounted, onUnmounted, ref, toRefs, watchEffect, withDefaults } from 'vue'
import { useRouter } from 'vue-router'
import message from '@arco-design/web-vue/es/message'
import {
  addQuestionUsingPost,
  editQuestionUsingPost,
  listQuestionVoByPageUsingPost
} from '@/api/questionController'
import { useUnsavedChangesStore } from '@/store/unsavedChangesStore'
import { getAppVoByIdUsingGet } from '@/api/appController'
import AiGenerateQuestionDrawer from '@/views/add/components/AiGenerateQuestionDrawer.vue'
import API from '@/api'
import { APP_TYPE_MAP } from '@/constant/app'
import {useLoginUserStore} from "@/store/userStore";

const router = useRouter()
const props = withDefaults(defineProps<{ appId: string }>(), {
  appId: () => ''
})
const { appId } = toRefs(props)

// 题目内容结构（理解为题目列表）
const questionContent = ref<API.QuestionContentDTO[]>([])
const oldQuestion = ref<API.QuestionVO | undefined>(undefined)
const initialQuestionContent = ref<API.QuestionContentDTO[]>([])
const unsavedChangesStore = useUnsavedChangesStore()
const loginUserStore = useLoginUserStore();
const appType = ref<any>()
const userId = ref<number>()
const appVO = ref<API.AppVO>()

// 折叠状态
const collapseStates = ref<boolean[]>([])
const optionCollapseStates = ref<boolean[][]>([])
const isCollapseStates = ref<boolean>(false)
const isOptionCollapseStates = ref<boolean>(false)

/**
 * 初始化折叠状态
 */
const initializeCollapseStates = () => {
  collapseStates.value = questionContent.value.map(() => false)
  optionCollapseStates.value = questionContent.value.map((question) =>
    question.options.map(() => false)
  )
}

/**
 * 加载数据
 */
const loadData = async () => {
  if (!appId.value) {
    return
  }
  try {
    const res = await listQuestionVoByPageUsingPost({
      appId: appId.value,
      current: 1,
      pageSize: 1,
      sortField: 'createTime',
      sortOrder: 'descend'
    })
    if (res.data.code === 0 && res.data.data?.records) {
      oldQuestion.value = res.data.data.records[0]
      questionContent.value = oldQuestion.value?.questionContent ?? []
      initialQuestionContent.value = JSON.parse(JSON.stringify(questionContent.value)) //深拷贝
      initializeCollapseStates() // 初始化折叠状态
    } else {
      message.error(`获取数据失败，${res.data.message}`)
    }
  } catch (error) {
    message.error('加载数据时出现错误，请稍后重试。')
  }
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
    userId.value= res.data.data?.userId
    if(userId.value !== loginUserStore.loginUser.id){
      router.push(`/app/detail/${appId.value}`)
    }
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  if (!appId.value) {
    return
  }
  const appVOres = await getAppVoByIdUsingGet({
    id: appId.value as any
  })
  if (appVOres.data.code === 0) {
    appVO.value = appVOres.data.data
  } else {
    message.error('获取应用数据失败，' + res.data.message)
  }
}
// 获取旧数据
watchEffect(() => {
  // loadData();
  unsavedChangesStore.setUnsavedChanges(
    JSON.stringify(questionContent.value) !== JSON.stringify(initialQuestionContent.value)
  )
})
onMounted(() => {
  loadData()
  unsavedChangesStore.setUnsavedChanges(false)
  loadAppType()}
)

/**
 * 提交
 */
const handleSubmit = async () => {
  if (!appId.value || !questionContent.value) {
    return
  }
  try {
    let res
    if (oldQuestion.value?.id) {
      // 修改操作
      res = await editQuestionUsingPost({
        id: oldQuestion.value.id,
        questionContent: questionContent.value
      })
    } else {
      // 创建操作
      res = await addQuestionUsingPost({
        appId: appId.value,
        questionContent: questionContent.value
      })
    }
    if (res.data.code === 0) {
      message.success('操作成功，即将跳转到应用详情页')
      initialQuestionContent.value = JSON.parse(JSON.stringify(questionContent.value)) //深拷贝
      setTimeout(() => {
        router.push(`/app/detail/${appId.value}`)
      }, 3000)
    } else {
      message.error(`操作失败，${res.data.message}`)
    }
  } catch (error) {
    message.error('提交数据时出现错误，请稍后重试。')
  }
}
//从ai获取题目信息
const upQuestionDate = (aiQuestionContent: API.QuestionContentDTO[]) => {
  questionContent.value = aiQuestionContent ?? []
  initialQuestionContent.value = JSON.parse(JSON.stringify(questionContent.value)) //深拷贝
  initializeCollapseStates() // 初始化折叠状态
}
//从ai获取题目信息(SSE)
const onSSESuccess = (aiQuestionContent: API.QuestionContentDTO) => {
  questionContent.value = [...questionContent.value, aiQuestionContent]
  initialQuestionContent.value = JSON.parse(JSON.stringify(questionContent.value)) //深拷贝
  initializeCollapseStates() // 初始化折叠状态
}
/**
 * SSE 开始生成
 * @param event
 */
const onSSEStart = (event: any) => {
  message.success("开始生成");
};

/**
 * SSE 生成完毕
 * @param event
 */
const onSSEClose = (event: any) => {

  message.success("生成完毕");
};

// 添加题目
const addQuestion = (index: number) => {
  questionContent.value.splice(index, 0, {
    title: '',
    options: [{ key: '', value: '', result: '', score: '' }]
  })
  collapseStates.value.splice(index, 0, false)
  optionCollapseStates.value.splice(index, 0, [])
}

// 删除题目
const deleteQuestion = (index: number) => {
  questionContent.value.splice(index, 1)
  collapseStates.value.splice(index, 1)
  optionCollapseStates.value.splice(index, 1)
}

// 添加选项
const addQuestionOption = (index: number, optionIndex: number) => {
  questionContent.value[index].options.splice(optionIndex, 0, {
    key: '',
    value: '',
    result: '',
    score: undefined
  })
  optionCollapseStates.value[index].splice(optionIndex, 0, false)
}

// 删除选项
const deleteQuestionOption = (index: number, optionIndex: number) => {
  questionContent.value[index].options.splice(optionIndex, 1)
  optionCollapseStates.value[index].splice(optionIndex, 1)
}

// 切换折叠状态
const toggleCollapse = (index: number) => {
  collapseStates.value[index] = !collapseStates.value[index]
}
// 切换全部折叠状态
const toggleAllCollapse = () => {
  // 切换所有题目的折叠状态
  collapseStates.value = questionContent.value.map(() => !isCollapseStates.value)
  isCollapseStates.value = !isCollapseStates.value

  // 切换所有选项的折叠状态
  toggleAllOptionCollapse()
}

// 切换选项折叠状态
const toggleOptionCollapse = (index: number, optionIndex: number) => {
  optionCollapseStates.value[index][optionIndex] = !optionCollapseStates.value[index][optionIndex]
}

// 切换所有选项折叠状态
const toggleAllOptionCollapse = () => {
  questionContent.value.forEach((question, qIndex) => {
    optionCollapseStates.value[qIndex] = question.options.map(() => !isOptionCollapseStates.value)
  })
  isOptionCollapseStates.value = !isOptionCollapseStates.value
}

// 处理浏览器的返回和刷新
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  const hasUnsavedChanges =
    JSON.stringify(questionContent.value) !== JSON.stringify(initialQuestionContent.value)
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
#AddQuestionPage {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 70vh;
  width: 100%;
  max-width: 1000px;
  padding: 20px;
  margin: 0 auto;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  margin-bottom: 20px;
}

.a-input,
.a-select,
.a-textarea {
  width: 100%;
}

.login-button {
  width: 100%;
  text-align: center;
}

.login-button .a-button {
  width: 100%;
  max-width: 150px;
}

.no-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-collapse,
.option-collapse {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fff;
}

.option-details {
  padding: 10px;
}

@media (max-width: 480px) {
  #AddQuestionPage {
    width: 90%;
    padding: 10px;
  }
}
</style>
