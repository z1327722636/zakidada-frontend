import { type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserLayout from '../Layouts/UserLayout.vue'
import BasicLayout from '../Layouts/BasicLayout.vue'
import AboutView from '@/views/AboutView.vue'
import Admin from '@/views/Admin.vue'
import ACCESS_ENUM from '@/access/accessEnum'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'mian',
    redirect: '/home',
    component: BasicLayout,
    children: [
      {
        path: '/home',
        name: '1',
        component: HomeView
      },
      {
        path: '/about',
        name: '2',
        component: AboutView,
        meta: {
          access: ACCESS_ENUM.USER
        }
      },
      {
        path: '/admin',
        name: 'admin',
        component: Admin,
        meta: {
          access: ACCESS_ENUM.ADMIN
        }
      }
    ]
  },
  {
    path: '/user',
    name: '用户',
    component: UserLayout,
    children: [
      {
        path: '/user/login',
        name: '用户登录',
        component: HomeView
      },
      {
        path: '/user/register',
        name: '用户注册',
        component: HomeView
      }
    ]
  }
]
