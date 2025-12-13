<!-- src/layouts/MainLayout.vue -->
<template>
  <div
    class="main-layout"
    :class="{ 'main-layout--sidebar-closed': !isSidebarOpen }"
  >
    <!-- ==================== PC/모바일 사이드바 토글 버튼 ==================== -->
    <button
      class="sidebar-toggle-btn"
      :class="{ 'sidebar-toggle-btn--active': isSidebarOpen }"
      @click="toggleSidebar"
      title="사이드바 토글"
      aria-label="사이드바 토글"
    >
      <img
        :src="isSidebarOpen ? sidebarCloseIcon : sidebarOpenIcon"
        :alt="isSidebarOpen ? '사이드바 닫기' : '사이드바 열기'"
        class="sidebar-toggle-btn__icon"
      />
    </button>

    <!-- ==================== 사이드바 ==================== -->
    <MainSidebar
      class="main-sidebar"
      :is-open="isSidebarOpen"
      @close="closeSidebar"
    />

    <!-- ==================== 메인 콘텐츠 영역 ==================== -->
    <main
      class="content-area"
      :style="gradientObject"
      :class="{ 'content-area--full': !isSidebarOpen }"
    >
      <router-view />
    </main>
  </div>
</template>

<script setup>
/**
 * MainLayout.vue - 메인 페이지 전체 레이아웃 (완전 수정 버전)
 *
 * 주요 수정사항:
 * 1. ✅ 토글 버튼을 absolute에서 relative로 변경
 * 2. ✅ 모바일에서도 토글 버튼 표시
 * 3. ✅ Grid 레이아웃 정상화
 * 4. ✅ 사이드바 닫힐 때 콘텐츠 제대로 확장
 * 5. ✅ 반응형 완벽 구현
 */

import { ref, onMounted, onUnmounted } from "vue";
import MainSidebar from "@/components/sidebar/MainSidebar.vue";
import { useGradient } from "@/composables/useGradient.js";
import { useConfigStore } from "@/stores/configStore";

// 아이콘 import
import sidebarOpenIcon from "@/assets/images/icon/sidebar_toggle_open.png";
import sidebarCloseIcon from "@/assets/images/icon/sidebar_toggle_close.png";

const configStore = useConfigStore();
const isSidebarOpen = ref(true);

/* ==================== Composable 연동 ==================== */

const { gradientObject, setGradient } = useGradient();

const initializeGradient = () => {
  console.log("🎨 MainLayout 그래디언트 초기화");
  setGradient(configStore.mainHoverColorHexCode, "#FFFFFF", 360);
};

/* ==================== 메서드 ==================== */

/**
 * toggleSidebar: 사이드바 토글
 *
 * 동작:
 * 1. isSidebarOpen 상태 반전
 * 2. CSS Grid 자동 조정
 * 3. 부드러운 애니메이션 실행
 */
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  console.log("🔄 사이드바 토글:", isSidebarOpen.value ? "열음" : "닫음");
};

/**
 * closeSidebar: 사이드바 닫기
 *
 * 모바일에서 채팅 선택 시 자동으로 사이드바 닫기
 */
const closeSidebar = () => {
  // TODO: 해상도에 변화가 생긴다면 닫거나 채팅 시작 시 닫히거나 하는 로직 추가 예정
};

/* ==================== 라이프사이클 ==================== */

onMounted(() => {
  console.log("✅ MainLayout 마운트됨");

  // 1. 그래디언트 초기화
  initializeGradient();

  // 2. 초기상태 로그
  console.log("📐 초기 상태:", {
    isSidebarOpen: isSidebarOpen.value,
  });
});

onUnmounted(() => {
  console.log("🗑️ MainLayout 언마운트됨");
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

/* ==================== MainLayout 전체 구조 ==================== */

.main-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 1fr;

  width: 100%;
  height: 100%; /* ⭐ 세로 꽉 차게 */
  min-height: 0; /* ⭐ 중요 */
  overflow-y: auto;
  margin: 0;
  padding: 0;

  /* Grid 열 크기 변경 시 부드러운 애니메이션 */
  transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* 사이드바 닫혔을 때: 1열 레이아웃 */
  &--sidebar-closed {
    grid-template-columns: 1fr;
  }
}

/* ==================== 사이드바 토글 버튼 ==================== */

.sidebar-toggle-btn {
  position: absolute;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 1001;

  width: 40px;
  height: 40px;
  border-radius: $border-radius-md;
  background-color: $white;
  border: 1px solid $gray-200;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* 사이드바 열려있을 때 위치 */
  .main-layout:has(.sidebar--open) & {
    left: calc(250px + $spacing-4);
  }

  &:hover {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    box-shadow: $shadow-md;
    transform: scale(1.08);

    .sidebar-toggle-btn__icon {
      filter: brightness(0) invert(1);
    }
  }

  &--active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);

    .sidebar-toggle-btn__icon {
      filter: brightness(0) invert(1);
    }
  }

  &__icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    transition: filter 0.3s ease;
  }
}

/* ==================== 메인 콘텐츠 영역 ==================== */

.content-area {
  /* 
    Grid의 두 번째 셀 (또는 첫 번째 셀 모바일)
  */
  grid-column: 2 / 3; // 만약, 데스크톱 해상도에서 밀리지 않길 원한다면  1 / -1로 설정한다
  grid-row: 1 / 2;

  /* 스크롤 가능 */
  overflow-y: auto;
  overflow-x: hidden;
  /* 마진/패딩 제거 */
  margin: 0;
  padding: 0;
  transition: grid-column 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* ✅ 세로 중앙 정렬 추가 */
  display: flex;
  flex-direction: column;
  justify-content: center; /* 세로 중앙 정렬 */
  align-items: stretch; /* ✅ 가로는 늘려서 기본 정렬 유지 */

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: $gray-100;
  }

  &::-webkit-scrollbar-thumb {
    background: $gray-300;
    border-radius: 4px;
    transition: background 0.3s ease;

    &:hover {
      background: $gray-400;
    }
  }

  &--full {
    grid-column: 1 / -1;
  }
}

/* Tablet/Mobile (1024px 이하) */
@media (max-width: 768px) {
  .main-layout {
    /* 1열로 변경 */
    grid-template-columns: 2fr;
    .main-sidebar {
      grid-column: 1 / 2;
    }
  }

  .content-area {
    /* 첫 번째 열 */
    grid-column: 2 / 2;
  }
}

/* ==================== 초소형 모바일 (640px 이하) ==================== */
@media (max-width: 640px) {
  .sidebar-toggle-btn {
    width: 36px;
    height: 36px;
    top: $spacing-3;
    left: $spacing-3;

    &__icon {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
