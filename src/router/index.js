/**
 * * Vue3 라우터 설정 파일
 * 주요 특징
 * 1. createRouter & createWebHistory 사용
 * 2. routes 배열에 경로 정의
 * 3. 동적 impoort로 코드 스플리팅
 * 4. route guard(beforeEach)로 권한 관리 가능
 * 4-(1). 사용자 시나리오
 * - 로그인 하지 않은 사용자가 /chat에 접근 시도 -> /login으로 redirect
 * - 로그인한 사용자가 /login에 접근 시도 -> /chat으로 redirect
 * 5. route 구조
 * 5-(1). 기본 구조
 *  * {
 *   path: '/url-경로',
 *   name: '라우트 이름',
 *   component: () => import('페이지 경로'),
 *   meta: { 메타 정보 }
 * }
 * 라우트 이름은 잘 명시해주면 나중에 path 기반으로 동적 routing안해도 되니까, name을 잘 지정하는게 좋음
 * 5-(2). 구조에 의거한 attribute
 * path: 사용자가 접근하는 URL
 * name: 프로그래밍 방식으로 이동할 때 사용
 * component: 동적 import로 코드 스플리팅 (성능 최적화) - 처음 app 실행 시 모든 component를 불러오지 않기 때문에 초기 bundle size가 확 준다.
 * meta: 라우트 메타데이터 (권한, 레이아웃 등)
 **/
import { createRouter, createWebHistory } from "vue-router";

// * ==================== 라우트 정의 ====================
const routes = [
  // 1.auth route
  // 1-(1). requiresAuth: false -> 로그인 하지 않은 사용자만 접근 가능
  // 1-(2). layout: 'Authlayout' -> navigation과 header가 존재하지 않는 특별한 layout 사용
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/LoginPage.vue"),
    meta: {
      requiresAuth: false, // 로그인 필수 아님
      layout: "AuthLayout", // 인증 레이아웃 사용
      title: "AI Works - 로그인", // 페이지 제목
    },
  },

  /**
   * 2. 메인 라우트 (채팅 페이지)
   *
   * requiresAuth: true → 로그인한 사용자만 접근 가능
   * layout: 'MainLayout' → 일반 메인 레이아웃 사용
   */
  {
    path: "/",
    redirect: "/main", // / 접근 시 /main으로 리다이렉트
  },
  {
    path: "/main",
    name: "Main",
    component: () => import("../pages/MainPage.vue"),
    meta: {
      requiresAuth: true, // 로그인 필수
      layout: "MainLayout", // 메인 레이아웃 사용
      title: "AI Works - 메인",
    },
  },
];

// ==================== 라우트 가드 (Navigation Guard) ====================
// TODO: 이곳에서부터 다시

export const router = createRouter({
  // histroy mode : 깔끔한 URL 사용
  history: createWebHistory(import.meta.env.BASE_URL),
  // 배열 routes
  routes,
  // 페이지 전환 시 항상 최상단으로 스크롤
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
