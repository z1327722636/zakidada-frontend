//1.判断页面是否需要权限
//2.如果需要权限，判断你是否登录，否则直接放行
//3.如果登录，判断是否拥有该权限
//4.如果拥有该权限，放行，否则拒绝

import { useLoginUserStore } from '@/store/userStore'
import {router} from '@/router'
import ACCESS_ENUM from '@/access/accessEnum'
import checkAccess from '@/access/checkAccess'
import {useUnsavedChangesStore} from "@/store/unsavedChangesStore";

router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  const unsavedChangesStore = useUnsavedChangesStore()
  let loginUser = loginUserStore.loginUser

  //自动登录，为了避免你登陆，第一次进入新的页面，需要重新登录
  if (!loginUser || !loginUser.userRole) {
    // 加 await 是为了等用户登录成功之后，再执行后续的代码
    await loginUserStore.getUserInfo()
    loginUser = loginUserStore.loginUser
  }

  console.log('登陆用户信息', loginUser)

  // 获取目标路由的访问权限要求，默认为 NOT_LOGIN
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN


  // 如果目标页面需要权限
  if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
    // 如果用户未登录，重定向到登录页面
    if (!loginUser || loginUser.userRole === ACCESS_ENUM.NOT_LOGIN) {
      const targetPath = to.fullPath;
      next(`/user/login?redirect=${targetPath}`);
      return
    }
    // 如果用户已登录但权限不足，重定向到无权限页面
    if (!checkAccess(loginUser, needAccess)) {
      next('/noAuth')
      return
    }
  }
  // 否则，允许导航
  next()
})
