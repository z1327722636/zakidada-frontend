<template>
  <div id="appDetailPage">
    <a-card>
      <a-row style="margin-bottom: 16px">
        <a-col flex="auto" class="content-wrapper">
          <h2>{{ data.appName }}</h2>
          <p>{{ data.appDesc }}</p>
          <p>应用类型：{{ APP_TYPE_MAP[data.appType as 0 | 1] }}</p>
          <p>评分策略：{{ APP_SCORING_STRATEGY_MAP[data.scoringStrategy as 0 | 1] }}</p>
          <p>
            <a-space>
              作者：
              <div :style="{ display: 'flex', alignItems: 'center' }">
                <a-avatar
                  :size="24"
                  :image-url="data.user?.userAvatar"
                  :style="{ marginRight: '8px' }"
                />
                <a-typography-text>{{ data.user?.userName ?? '无名' }} </a-typography-text>
              </div>
            </a-space>
          </p>
          <p>创建时间：{{ dayjs(data.createTime).format('YYYY-MM-DD HH:mm:ss') }}</p>
          <a-space wrap size="medium">
            <a-button type="primary" @click="router.push(`/answer/do/${id}`)">开始答题 </a-button>
            <a-button @click="doShare">分享应用</a-button>
            <a-button v-if="isMy" @click="router.push(`/add/question/${id}`)">设置题目 </a-button>
            <a-button v-if="isMy" @click="router.push(`/add/scoring_result/${id}`)"
              >设置评分
            </a-button>
            <a-button v-if="isMy" @click="router.push(`/add/app/${id}`)">修改应用</a-button>
          </a-space>
        </a-col>
        <a-col flex="320px">
          <a-image width="100%" :src="data.appIcon" />
        </a-col>
      </a-row>
    </a-card>
  </div>
  <ShareModal ref="shareModalRef" :link="shareLink" />
</template>

<script setup lang="ts">
import API from '@/api'
import { computed, onMounted, ref, toRefs, watchEffect } from 'vue'
import { getAppVoByIdUsingGet } from '@/api/appController'
import message from '@arco-design/web-vue/es/message'
import { APP_SCORING_STRATEGY_MAP, APP_TYPE_MAP } from '../../constant/app'
import { dayjs } from '@arco-design/web-vue/es/_utils/date'
import { useLoginUserStore } from '@/store/userStore'
import ShareModal from '@/components/ShareModal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = withDefaults(defineProps<{ id: String }>(), {
  id: () => ''
})

const data = ref<API.AppVO>({})
const loading = ref(false)
const { id } = toRefs(props) // 使用 toRefs 将 props 转换为 ref

// 获取登录用户
const loginUserStore = useLoginUserStore()
let loginUserId = loginUserStore.loginUser?.id
// 是否为本人创建
const isMy = computed(() => {
  return loginUserId && loginUserId === data.value.userId
})
/**
 * 数据渲染
 */
const loadData = async () => {
  loading.value = true
  try {
    if (!id.value) {
      return
    }
    const res = await getAppVoByIdUsingGet({
      id: id.value as any
    })
    if (res.data.code === 0) {
      data.value = res.data.data as any
    } else {
      message.error('获取数据失败，' + res.data.message)
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
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  loadData()
})

// 分享弹窗的引用
const shareModalRef = ref()

// 分享链接
const shareLink = `${window.location.protocol}//${window.location.host}/app/detail/${id.value}`

// 分享
const doShare = (e: Event) => {
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped>
.content-wrapper > * {
  margin: 24px;
}
</style>
