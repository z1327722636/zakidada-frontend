<template>
  <div>
    <a-button type="outline" @click="handleClick">使用AI生成题目</a-button>
    <a-drawer :width="420" :visible="visible" unmountOnClose :footer="false" @cancel="handleCancel">
      <template #title> 使用AI生成题目 </template>
      <div>
        <a-form :model="form" label-align="left" auto-label-width @submit-success="handleSubmit">
          <a-form-item label="应用ID" field="appId">
            {{ appId }}
          </a-form-item>

          <a-form-item label="应用名称" field="appName">
            {{ appVO?.appName }}
          </a-form-item>
          <a-form-item label="应用描述" field="appDesc">
            {{ appVO?.appDesc }}
          </a-form-item>
          <a-form-item label="应用类型" field="appType">
            {{ APP_TYPE_MAP[appVO?.appType] }}
          </a-form-item>
          <a-form-item label="题目数量" field="questionNumber">
            <a-input-number
              v-model="form.questionNumber"
              placeholder="请输入题目数量"
              :min="1"
              :max="30"
            />
          </a-form-item>
          <a-form-item label="每题选项数量" field="optionNumber">
            <a-input-number
              v-model="form.optionNumber"
              placeholder="请输入每题选项数量"
              :min="2"
              :max="6"
            />
          </a-form-item>
          <a-form-item>
            <span style="color: dodgerblue"
              >AI是根据你是设置app名称，描述和类型生成，如果题目生成不合理，可以尝试修改app的内容</span
            >
          </a-form-item>
          <a-form-item>
            <div class="login-button">
              <a-space>
              <a-button
                type="primary"
                html-type="submit"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? '生成中...' : '生成题目' }}
              </a-button>
              <a-button :loading="sseSubmitting" style="width: 110px" @click="handleSSESubmit">
                {{ sseSubmitting ? '生成中' : '实时生成' }}
              </a-button>
              </a-space>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, toRefs, withDefaults } from 'vue'
import message from '@arco-design/web-vue/es/message'
import { APP_TYPE_MAP } from '../../../constant/app'
import { aiGenerateQuestionUsingPost } from '@/api/questionController'
import API from '@/api'

const props = withDefaults(
  defineProps<{
    appId: string
    upQuestionDate: (aiQuestionContent: API.QuestionContentDTO[]) => void
    appVO: API.AppVO
    onSSESuccess?: (result: API.QuestionContentDTO) => void
    onSSEStart?: (event: any) => void
    onSSEClose?: (event: any) => void
  }>(),
  {
    appId: () => ''
  }
)
const { appId } = toRefs(props)
const visible = ref(false)
const form = ref<API.AiGenerateQuestionRequest>({
  appId: appId.value as any,
  questionNumber: 3,
  optionNumber: 3
})

const isSubmitting = ref(false) // 请求状态标志
const sseSubmitting = ref(false) // 请求状态标志

const handleClick = () => {
  visible.value = true
}
const handleCancel = () => {
  visible.value = false
}

const handleSubmit = async () => {
  isSubmitting.value = true // 开始请求前设置为true
  try {
    const res = await aiGenerateQuestionUsingPost({ ...form.value })
    if (res.data.code === 0) {
      props.upQuestionDate(res.data.data)
      visible.value = false
    } else {
      message.error('生成题目失败，' + res.data.message)
    }
  } finally {
    isSubmitting.value = false // 请求结束后重置为false
  }
}

// const handleSSESubmit = async () => {
//   if (!appId) {
//     return
//   }
//   sseSubmitting.value = true // 开始请求前设置为true
//   const eventSource = new EventSource(
//     'http://localhost:8101/api/question/ai_generate/sse' +
//       `?appId=${appId.value}&optionNumber=${form.value.optionNumber}&questionNumber=${form.value.questionNumber}`
//   )
//   let first = true
//   eventSource.onmessage = (event) => {
//     // 监听message事件
//     if (first) {
//       props.onSSEStart?.(event)
//       handleCancel()
//       first = !first
//     }
//     props.onSSESuccess?.(JSON.parse(event.data))
//   }
//   eventSource.onopen = (event) => {
//     // 监听open事件
//     console.log('连接成功')
//   }
//   eventSource.onerror = (event) => {
//     // 监听error事件
//     if (event.eventPhase === EventSource.CLOSED) {
//       console.log('关闭连接')
//       props.onSSEClose?.(event)
//       eventSource.close()
//     } else {
//       eventSource.close()
//     }
//   }
//   sseSubmitting.value = false
// }

/**
 * 提交（实时生成）
 */
const handleSSESubmit = async () => {
  if (!props.appId) {
    return;
  }
  sseSubmitting.value = true;
  // 创建 SSE 请求
  const eventSource = new EventSource(
      // todo 手动填写完整的后端地址
      "http://localhost:8101/api/question/ai_generate/sse" +
      `?appId=${props.appId}&optionNumber=${form.value.optionNumber}&questionNumber=${form.value.questionNumber}`, { withCredentials: true }
  );
  let first = true;
  // 接收消息
  eventSource.onmessage = function (event) {
    if (first) {
      props.onSSEStart?.(event);
      handleCancel();
      first = !first;
    }
    props.onSSESuccess?.(JSON.parse(event.data));
  };
  // 报错或连接关闭时触发
  eventSource.onerror = function (event) {
    if (event.eventPhase === EventSource.CLOSED) {
      console.log("关闭连接");
      props.onSSEClose?.(event);
      eventSource.close();
    } else {
      eventSource.close();
    }
  };
  sseSubmitting.value = false;
};
</script>

<style scoped>
a-drawer {
  padding: 16px;
}

a-form-item {
  margin-bottom: 16px;
}

a-button {
  margin-top: 16px;
}
</style>
