<template>
  <div id="app">
    <!-- <LoginPage /> -->
    <!-- <CommonModal v-if="uiStore.isCommonModalOpen" /> -->
    <RouterView />
  </div>
</template>

<script setup>
/**
 * Vue Router v4에서는 RouterView를 import할 필요 없음
 * 자동으로 전역 컴포넌트로 등록됨
 */
import LoginPage from "./pages/LoginPage.vue";
import { RouterView } from "vue-router";
</script>
