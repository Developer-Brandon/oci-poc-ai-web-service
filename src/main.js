/**
 * src/main.js
 *
 * Vue3 애플리케이션의 진입점입니다.
 * Vue2에서는 'new Vue()' 형태였지만, Vue3에서는 'createApp()' 함수를 사용합니다.
 *
 * 중요한 변화점 (Vue2 -> Vue3):
 * 1. createApp() 함수 사용
 * 2. Vuex -> Pinia로 변경
 * 3. prototype으로 전역 속성 추가 X, provide/inject 또는 app.config.globalProperties 사용
 * 4. 라이프사이클 훅 이름 변경 (mounted, onMounted 등)
 */

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "@/assets/styles/global.scss"; // 전역 스타일
import "@/assets/styles/variables.scss"; // 스타일 변수
import "@/assets/styles/mixins.scss"; // 스타일 믹스인

const app = createApp(App); // Vue 애플리케이션 인스턴스 생성

/**
 * Pinia 스토어 설정
 *
 * Pinia는 Vue3의 공식 상태관리 라이브러리입니다.
 * Vuex보다 훨씬 간단하고, TypeScript 지원이 우수합니다.
 *
 * 사용 예시:
 * import { useChatStore } from '@/stores/chat'
 * const chatStore = useChatStore()
 *
 * 특징:
 * - 각 store는 자동으로 devtools와 통합됨
 * - Hot Module Replacement (HMR) 지원
 * - 더 간단한 API (mutations 불필요)
 */
app.use(createPinia());

/**
 * 전역 프로퍼티 설정 (선택사항)
 *
 * 모든 컴포넌트에서 this.$config 등으로 접근 가능
 */
app.config.golobalProperties.$appName = "OCI AI Web Service";

app.mount("#app");
