<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { onMounted } from "vue";

/**
 * 🔑 핵심 로직: 앱 초기화 시 세션 자동 복구
 * 페이지 새로고침 시:
 * 1. App.vue의 onMounted에서 restoreSession() 호출
 * 2. localStorage에서 세션 데이터 복원
 * 3. 라우터가 인증 상태를 기반으로 올바른 페이지로 네비게이션
 */
const authStore = useAuthStore();

onMounted(() => {
  // ✅ 앱 시작 시 가장 먼저 세션 복구
  authStore.restoreSession();
  console.log("✅ 앱 초기화 완료, 세션 상태:", authStore.isLoggedIn);
});
</script>
