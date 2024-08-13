import ACCESS_ENUM from './accessEnum'

/**
 * 检查权限（判断当前登录用户是否具有某个权限）
 * @param loginUser 当前登录用户
 * @param needAccess 需要有的权限
 * @return boolean 有无权限
 */
const checkUserAccess = (loginUser: any, needAccess = ACCESS_ENUM.NOT_LOGIN) => {
  //获取当前用户的权限，如果为空，则默认为未登录状态

  const loginUserAccess = loginUser?.userRole ?? ACCESS_ENUM.NOT_LOGIN
  switch (needAccess) {
    case ACCESS_ENUM.NOT_LOGIN:
      return true
    case ACCESS_ENUM.USER:
      console.log('用户', loginUserAccess)
      return loginUserAccess !== ACCESS_ENUM.NOT_LOGIN
    case ACCESS_ENUM.ADMIN:
      return loginUserAccess === ACCESS_ENUM.ADMIN
    default:
      return false
  }
}

export default checkUserAccess
