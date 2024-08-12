<template>
  <div class="account-settings">
    <div class="security-score">
      <div class="score">{{ user.securityScore }}</div>
      <div class="status">低风险</div>
      <p>为了更好的保障您的账号安全，请您继续完善：绑定安全邮箱并设置密码</p>
    </div>
    <div class="settings-list">
      <div class="settings-item" v-for="(item, index) in settings" :key="index">
        <div class="label">{{ item.label }}</div>
        <div class="value">{{ item.value || '未设置' }}</div>
        <a v-if="item.action" @click="item.action">{{ item.actionLabel }}</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';

const user = ref({
  securityScore: 90, // 用户的安全分数
});

const settings = ref([
  {label: '密码', value: ' ', actionLabel: '设置密码', action: () => alert('设置密码功能待实现')},
  {label: '手机', value: '155****7690', actionLabel: '修改手机', action: () => alert('修改手机功能待实现')},
  {label: '邮箱', value: '', actionLabel: '绑定邮箱', action: () => alert('绑定邮箱功能待实现')},
  {label: '三方账号', value: 'QQ 微信', actionLabel: '绑定/解绑', action: () => alert('绑定/解绑功能待实现')},
  {label: '登录记录', value: ' ', actionLabel: '查看记录', action: () => alert('查看记录功能待实现')},
  {label: '账号注销', value: ' ', actionLabel: '立即注销', action: () => alert('立即注销功能待实现')},
]);
</script>

<style scoped>
.account-settings {

  margin: 0 auto;
}

.security-score {
  text-align: center;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.score {
  font-size: 48px;
  color: #f39c12;
  margin-bottom: 10px;
}

.status {
  font-size: 16px;
  color: #f39c12;
}

.settings-list {
  border-top: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.label {
  font-weight: bold;
}

.value {
  flex-grow: 1;
  text-align: right;
  margin-right: 20px;
  color: #888;
}

a {
  color: #3498db;
  cursor: pointer;
}

a:hover {
  text-decoration: underline;
}
</style>
