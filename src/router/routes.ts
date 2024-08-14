import { type RouteRecordRaw } from 'vue-router'
import ACCESS_ENUM from '@/access/accessEnum'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'main',
    redirect: '/home', // 主页
    component: () => import('../Layouts/BasicLayout.vue'),
    children: [
      {
        path: '/home',
        name: '主页', // 首页
        component: () => import('../views/HomeView.vue')
      },
      {
        path: '/app/detail/:id',
        name: '应用详情',
        component: () => import('@/views/app/AppDetailPage.vue'),
        props: true,
        meta: {
          hideInMenu: true
        }
      },
      {
        path: '/add/app',
        name: '创建应用',
        component: () => import('@/views/add/AddAppPage.vue')
      },
      {
        path: '/add/app/:id',
        name: '修改应用',
        props: true,
        component: () => import('@/views/add/AddAppPage.vue'),
        meta: {
          hideInMenu: true
        }
      },
      {
        path: '/add/question/:appId',
        name: '创建题目',
        component: () => import('@/views/add/AddQuestionPage.vue'),
        props: true,
        meta: {
          hideInMenu: true
        }
      },
      {
        path: '/add/scoring_result/:appId',
        name: '创建评分',
        component: () => import('@/views/add/AddScoringResultPage.vue'),
        props: true,
        meta: {
          hideInMenu: true
        }
      },
      // {
      //   path: '/Demo',
      //   name: 'Demo', // 关于
      //   component:   (() => import('@/views/demoView.vue')),
      //   meta: {
      //     access: ACCESS_ENUM.USER // 用户权限
      //   }
      // },
      {
        path: '/answer/do/:appId',
        name: '答题',
        component: () => import('@/views/answer/DoAnswerPage.vue'),
        props: true,
        meta: {
          hideInMenu: true,
          access: ACCESS_ENUM.USER
        }
      },
      {
        path: '/answer/result/:id',
        name: '答题结果',
        component: () => import('@/views/answer/AnswerResultPage.vue'),
        props: true,
        meta: {
          hideInMenu: true,
          access: ACCESS_ENUM.USER
        }
      },
      {
        path: '/answer/my',
        name: '我的答题',
        component: () => import('@/views/answer/MyAnswerPage.vue'),
        meta: {
          access: ACCESS_ENUM.USER
        }
      },
      {
        path: '/app/my',
        name: '我的应用',
        component: () => import('@/views/app/MyAppPage.vue'),
        meta: {
          access: ACCESS_ENUM.USER
        }
      },
      {
        path: '/app_statistic',
        name: '应用统计',
        component: () => import('@/views/statistic/AppStatisticPage.vue'),
        meta: {
          access: ACCESS_ENUM.ADMIN
        }
      },
      {
        path: '/my',
        name: '个人中心',
        component: () => import('@/views/My/myView.vue'),
        redirect: '/my/detail',
        meta: {
          access: ACCESS_ENUM.USER,
          hideInMenu: true
        },
        children: [
          {
            path: '/my/detail',
            name: '个人资料',
            component: () => import('../views/My/MyDetailPage.vue'),
            meta: {
              access: ACCESS_ENUM.USER // 用户权限
            }
          },
          {
            path: '/my/account',
            name: '我的账号',
            component: () => import('@/views/My/MyAccountPage.vue'),
            meta: {
              access: ACCESS_ENUM.USER
            }
          }
        ]
      },
      {
        path: '/admin',
        name: '管理', // 管理
        redirect: '/admin/user',
        component: () => import('@/views/admin/AdminPage.vue'),
        meta: {
          access: ACCESS_ENUM.ADMIN // 管理员权限
        },
        children: [
          {
            path: '/admin/user',
            name: '用户管理',
            component: () => import('@/views/admin/AdminUserPage.vue'),
            meta: {
              access: ACCESS_ENUM.ADMIN // 用户权限
            }
          },
          {
            path: '/admin/app',
            name: '应用管理',
            component: () => import('@/views/admin/AdminAppPage.vue'),
            meta: {
              access: ACCESS_ENUM.ADMIN
            }
          },
          {
            path: '/admin/question',
            name: '题目管理',
            component: () => import('@/views/admin/AdminQuestionPage.vue'),
            meta: {
              access: ACCESS_ENUM.ADMIN
            }
          },
          {
            path: '/admin/scoring_result',
            name: '评分管理',
            component: () => import('@/views/admin/AdminScoringResultPage.vue'),
            meta: {
              access: ACCESS_ENUM.ADMIN
            }
          },
          {
            path: '/admin/user_answer',
            name: '回答管理',
            component: () => import('@/views/admin/AdminUserAnswerPage.vue'),
            meta: {
              access: ACCESS_ENUM.ADMIN
            }
          }
        ]
      }
    ]
  },
  {
    path: '/user', // 用户
    name: 'user',
    redirect: '/user/login',
    component: () => import('@/Layouts/UserLayout.vue'),
    children: [
      {
        path: '/user/login',
        name: 'user-login', // 用户登录
        component: () => import('@/views/user/UserLoginPage.vue')
      },
      {
        path: '/user/register',
        name: 'user-register', // 用户注册
        component: () => import('@/views/user/UserRegisterPage.vue')
      }
    ]
  }
]
