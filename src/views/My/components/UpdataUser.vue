<template>
  <div>
    <a-button type="outline" @click="handleClick"><slot>编辑</slot></a-button>
    <a-drawer :width="600" :visible="visible" unmountOnClose :footer="false" @cancel="handleCancel">
      <template #title>编辑信息</template>
      <div>
        <!--        {{form}}-->
        <a-form :model="form" label-align="left" auto-label-width @submit-success="handleSubmit">
          <a-form-item label="头像">
            <ImageUpload biz="user_avatar" :on-change="doChange" :value="form.userAvatar" />
          </a-form-item>
          <a-form-item label="昵称">
            <a-input v-model="form.userName" placeholder="请输入用户名" />
          </a-form-item>
          <a-form-item label="个人简介">
            <div style="width: 300px">
              <!--              <Editor :value="form.userProfile ?? '他什么也没留下'" :handleChange="handleChange" />-->
              <!--              <Viewer />-->
              <textarea
                v-model="form.userProfile"
                rows="10"
                cols="50"
                placeholder="给自己一个介绍吧"
              ></textarea>
            </div>
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? '提交中...' : '提交' }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, withDefaults } from 'vue'
import message from '@arco-design/web-vue/es/message'
import { updateMyUserUsingPost } from '@/api/userController'
import ImageUpload from '@/components/ImageUpload.vue'
import Editor from '@/components/MdEditor.vue'
import Viewer from '@/components/MdViewer.vue'

const props = withDefaults(
  defineProps<{
    user: API.UserVO
    upUserData: (data: API.UserVO) => void
  }>(),
  {}
)

const form = ref({ ...props.user })

//获取用户编写的信息
const handleChange = (value: string) => {
  form.value.userProfile = value
}
const isSubmitting = ref(false)
const visible = ref(false)

const handleClick = () => {
  visible.value = true
}

const handleCancel = () => {
  visible.value = false
}

const handleSubmit = async () => {
  isSubmitting.value = true // 开始请求前设置为true
  try {
    const res = await updateMyUserUsingPost({
      userAvatar: form.value.userAvatar,
      userName: form.value.userName,
      userProfile: form.value.userProfile
    })
    if (res.data.code === 0) {
      props.upUserData(form.value)
      visible.value = false
      message.success('修改成功')
    } else {
      message.error('修改失败，' + res.data.message)
    }
  } catch (error) {
    message.error('请求失败')
  } finally {
    isSubmitting.value = false // 请求结束后重置为false
  }
}
//获取图片url
const doChange = (url: any) => {
  form.value.userAvatar = url
}
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
