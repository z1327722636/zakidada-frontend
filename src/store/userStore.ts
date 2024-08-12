import { defineStore } from 'pinia'
import { ref } from 'vue'
import {getLoginUserUsingGet, userLogoutUsingPost} from '../api/userController'
import ACCESS_ENUM from '@/access/accessEnum'
import {useRouter} from "vue-router";
import message from "@arco-design/web-vue/es/message";

/**
 * 登录用户信息全局状态
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({userName: "未登录",})
  const router = useRouter()
  function setNewLoginUser(user: API.LoginUserVO) {
    loginUser.value = user
  }

  async function getUserInfo() {
    const resUser = await getLoginUserUsingGet()
    if (resUser.data.code === 0 && resUser.data.data) {
      loginUser.value = resUser.data.data
    } else {
      loginUser.value = { userRole: ACCESS_ENUM.NOT_LOGIN }
    }
  }

  async function clearLoginUser() {

    const resUser = await userLogoutUsingPost()
    if (resUser.data.code === 0) {
      router.push("/user/login")
      message.success("退出登录成功")
      loginUser.value = {}
      loginUser.value = {userName: "未登录", userRole: ACCESS_ENUM.NOT_LOGIN}
    }else {
      message.error("退出登录失败")
    }

  }

  return { loginUser, setNewLoginUser, getUserInfo,clearLoginUser }
})
