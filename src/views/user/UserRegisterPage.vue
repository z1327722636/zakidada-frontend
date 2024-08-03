<template>
  <div id="userRegisterPage">
    <h2>用户注册</h2>
    <a-form :model="form" layout="vertical" @submit="handleSubmit">
      <a-form-item field="userAccount" label="账号">
        <a-input v-model="form.userAccount" placeholder="请输入账号"/>
      </a-form-item>
      <a-form-item field="userPassword" tooltip="密码不小于 8 位" label="密码">
        <a-input-password v-model="form.userPassword" placeholder="请输入密码"/>
      </a-form-item>
      <a-form-item field="checkPassword" tooltip="密码不小于 8 位" label="密码">
        <a-input-password v-model="form.checkPassword" placeholder="请再次输入密码"/>
      </a-form-item>
      <a-form-item field="login">
        <div class="switch" style="width: 100%; text-align: right">
          <p>已有账号?
            <router-link to="/user/login">立即登录</router-link>
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
import {useRouter} from "vue-router";
import message from "@arco-design/web-vue/es/message";
import {userRegisterUsingPost} from "@/api/userController";

const router = useRouter();

const form = reactive({
  userAccount: '',
  userPassword: '',
  checkPassword:'',
}) as API.UserRegisterRequest;


/**
 * 提交数据
 */
const handleSubmit = async () => {
  const response = await userRegisterUsingPost(form);
  if (response.data.code === 0) {
    message.success('注册成功');
    router.push({
      path: "/user/login",
      replace: true,
    })
  } else {
    message.error("注册失败，" + response.data.message);
  }
}


</script>

<style>
#userRegisterPage {
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
  #userRegisterPage {
    width: 95%; /* 小屏幕设备上的宽度 */
    padding: 10px; /* 减小内边距 */
  }
}
</style>
