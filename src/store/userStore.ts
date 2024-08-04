import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLoginUserUsingGet } from '../api/userController'
import ACCESS_ENUM from '@/access/accessEnum'

/**
 * 登录用户信息全局状态
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({userName: "未登录",})

  function setNewLoginUser(user: API.LoginUserVO) {
    loginUser.value = user
  }

  async function getUserInfo() {
    const resUser = await getLoginUserUsingGet()
    if (resUser.data.code === 0 && resUser.data.data) {
      loginUser.value = resUser.data.data
    } else {
      loginUser.value = { userRole: ACCESS_ENUM.NOT_LOGIN }

      // setTimeout(() => {
      //   loginUser.value = {
      //     // userRole: ACCESS_ENUM.NOT_LOGIN
      //     id: 1,
      //     userName: 'User',
      //     userRole: ACCESS_ENUM.USER
      //   }
      // }, 3000)
    }
  }

  return { loginUser, setNewLoginUser, getUserInfo }
})
