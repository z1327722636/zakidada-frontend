<template>
  <div id="userLoginPage">
    <h2>用户登录</h2>
    <a-form :model="form" layout="vertical" @submit="handleSubmit">
      <a-form-item field="userAccount" label="账号">
        <a-input v-model="form.userAccount" placeholder="请输入账号"/>
      </a-form-item>
      <a-form-item field="userPassword" tooltip="密码不小于 8 位" label="密码">
        <a-input-password v-model="form.userPassword" placeholder="请输入密码"/>
      </a-form-item>
      <a-form-item field="register">
        <div class="switch" style="width: 100%; text-align: right">
          <p>没有账号?
            <router-link to="/user/register">立刻注册</router-link>
          </p>
        </div>
      </a-form-item>
      <a-form-item>
        <div class="login-button" style="width: 100%; text-align: center">
          <a-button type="primary" html-type="submit" style="width: 120px">
            登录
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import {reactive} from 'vue';
import API from '@/api';
import {userLoginUsingPost} from "@/api/userController";
import {useLoginUserStore} from "@/store/userStore";
import {useRouter} from "vue-router";
import message from "@arco-design/web-vue/es/message";

const loginUserStore = useLoginUserStore();
const router = useRouter();

const form = reactive({
  userAccount: '',
  userPassword: '',
}) as API.UserLoginRequest;


/**
 * 提交数据
 */
const handleSubmit = async () => {
    const response = await userLoginUsingPost(form);
    if (response.data.code === 0) {
      await loginUserStore.getUserInfo();
      message.success('登录成功');
      // 获取 URL 中的 `redirect` 参数
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      let targetPath = redirect;
      console.log(targetPath)
      // 检查是否是完整的 URL
      if (targetPath&&targetPath.startsWith('http')) {
        const url = new URL(targetPath);
        targetPath = url.pathname;  // 只获取路径部分
      }
      // 跳转到指定页面或默认首页
      router.push({
        path:   targetPath  ? targetPath: '/',
        replace: true,
      });
    } else {
      message.error("登录失败，" + response.data.message);
    }
  }


</script>

<style>
#userLoginPage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 垂直居中 */
  min-height: 50vh;
  width: 90%; /* 相对单位 */
  max-width: 400px; /* 最大宽度 */
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  background-color: #fff; /* 添加背景颜色 */
}

@media (max-width: 480px) {
  #userLoginPage {
    width: 95%; /* 小屏幕设备上的宽度 */
    padding: 10px; /* 减小内边距 */
  }
}
</style>
