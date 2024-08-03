import { type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserLayout from '../Layouts/UserLayout.vue'
import BasicLayout from '../Layouts/BasicLayout.vue'
import AboutView from '@/views/AboutView.vue'
import UserLoginPage from '@/views/user/UserLoginPage.vue'
import UserRegisterPage from '@/views/user/UserRegisterPage.vue'
import Admin from '@/views/Admin.vue'
import ACCESS_ENUM from '@/access/accessEnum'

export const routes: Array<RouteRecordRaw> = [

  {
    path: '/',
    name: 'main', // 主页
    redirect: '/home',
    component: BasicLayout,
    children: [
      {
        path: 'home',
        name: 'home', // 首页
        component: HomeView
      },
      {
        path: 'about',
        name: 'about', // 关于
        component: AboutView,
        meta: {
          access: ACCESS_ENUM.USER // 用户权限
        }
      },
      {
        path: 'admin',
        name: 'admin', // 管理
        component: Admin,
        meta: {
          access: ACCESS_ENUM.ADMIN // 管理员权限
        }
      }
    ]
  },

  {
    path: '/user',// 用户
    name: 'user',
    redirect: '/user/login',
    component: UserLayout,
    children: [
      {
        path: 'login',
        name: 'user-login', // 用户登录
        component: UserLoginPage
      },
      {
        path: 'register',
        name: 'user-register', // 用户注册
        component: UserRegisterPage
      }
    ]
  }
]
