<!-- src/components/sidebar/MainSidebar.vue -->
<template>
  <!-- 
    ========================================
    Mobile Overlay (모바일에서만 표시)
    ========================================
    
    역할:
    - Mobile에서 Sidebar 외부 영역을 클릭할 때 닫히도록 함
    - 반투명 배경으로 시각적 피드백 제공
    - z-index를 sidebar보다 낮게 설정
  -->
  <div
    v-if="isMobileView && isOpen"
    class="sidebar-overlay"
    @click="closeSidebar"
  />

  <!-- 
    ========================================
    Main Sidebar Component
    ========================================
    
    Desktop (1024px 이상):
    - Grid 레이아웃의 첫 번째 열로 고정
    - 항상 표시
    
    Mobile (1024px 미만):
    - Fixed 위치로 변환
    - is-open 상태에 따라 슬라이드 애니메이션
    - transform: translateX(-100%) → translateX(0)
  -->
  <aside class="sidebar" :class="{ 'sidebar--open': isOpen }">
    <!-- ==================== 로고 섹션 ==================== -->
    <div class="sidebar__header">
      <div class="sidebar__logo">
        <img
          :src="configStore.logoImageUrl"
          alt="Packaging.AI Logo"
          class="sidebar__logo-image"
        />
      </div>
    </div>

    <!-- ==================== 새 채팅 버튼 ==================== -->
    <button class="sidebar__new-chat-btn" @click="startNewChat">
      <span class="sidebar__new-chat-text">새 채팅</span>
    </button>

    <!-- ==================== 검색창 ==================== -->
    <div class="sidebar__search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="검색어를 입력해주세요"
        class="sidebar__search-input"
        @input="handleSearch"
      />
      <img
        class="sidebar__search-icon"
        src="@/assets/images/icon/reading_grasses.png"
      />
    </div>

    <!-- ==================== 채팅 히스토리 섹션 ==================== -->
    <div class="sidebar__history">
      <!-- 채팅이 있는 경우 -->
      <template v-if="filteredChatSections.length > 0">
        <section
          v-for="section in filteredChatSections"
          :key="section.id"
          class="sidebar__history-section"
        >
          <!-- 섹션 제목 -->
          <h3 class="sidebar__history-section-title">{{ section.title }}</h3>

          <!-- 섹션 내 채팅 목록 -->
          <ul class="sidebar__chat-list">
            <li
              v-for="chat in section.chats"
              :key="chat.id"
              class="sidebar__chat-item"
              :class="{
                'sidebar__chat-item--active': chat.id === activeChatId,
              }"
              @click="selectChat(chat)"
            >
              <!-- 채팅 제목 -->
              <span
                class="sidebar__chat-title"
                v-if="editingChatId !== chat.id"
              >
                {{ chat.title }}
              </span>

              <!-- 편집 모드: 제목 입력 필드 -->
              <input
                v-if="editingChatId === chat.id"
                :key="`edit-${chat.id}`"
                :data-chat-id="chat.id"
                v-model="editingTitle"
                class="sidebar__chat-edit-input"
                type="text"
                @keydown="handleChatTitleKeydown($event, chat.id)"
                @blur="saveEditingChat(chat.id)"
                @click.stop
                placeholder="새로운 제목 입력..."
              />

              <!-- 호버 시 우측 메뉴 버튼 -->
              <div class="sidebar__chat-actions">
                <!-- 편집 모드가 아닐 때만 메뉴 버튼 표시 -->
                <button
                  v-if="editingChatId !== chat.id"
                  class="sidebar__chat-action-btn"
                  @click.stop="showContextMenu($event, chat.id)"
                  title="옵션"
                >
                  ⋯
                </button>
              </div>
            </li>
          </ul>
        </section>
      </template>

      <!-- 채팅이 없는 경우 -->
      <div v-else class="sidebar__empty">
        <p class="sidebar__empty-text">채팅이 없습니다.</p>
      </div>
    </div>

    <!-- ==================== SideBar Footer (사용자 정보) ==================== -->
    <div class="sidebar__footer">
      <!-- 사용자 프로필 -->
      <button class="sidebar__user-profile">
        <img
          :src="configStore.defaultProfileImage"
          alt="프로필"
          class="sidebar__user-avatar"
        />
        <div class="sidebar__user-info">
          <span class="sidebar__user-name">{{ userName }}</span>
          <span class="sidebar__user-role">manager</span>
        </div>
      </button>
    </div>
  </aside>

  <!-- =============== 우측 메뉴 (Context Menu) - 채팅 =============== -->
  <Teleport to="body" v-if="contextMenu.isVisible">
    <div class="sidebar__context-menu-overlay" @click="closeContextMenu" />
    <div
      class="sidebar__context-menu"
      :style="{
        top: contextMenu.position.top,
        left: contextMenu.position.left,
      }"
    >
      <!-- 메뉴 항목: 이름 바꾸기 -->
      <button
        class="sidebar__context-menu-item"
        @click="
          startEditingChat(
            contextMenu.chatId,
            chatSections
              .flatMap((s) => s.chats)
              .find((c) => c.id === contextMenu.chatId)?.title || ''
          )
        "
      >
        <span class="sidebar__context-menu-icon">
          <img :src="pencilIcon" />
        </span>
        <span class="sidebar__context-menu-text">이름 바꾸기</span>
      </button>

      <!-- 메뉴 항목: 삭제 -->
      <button
        class="sidebar__context-menu-item"
        @click="
          deleteChat(contextMenu.chatId);
          closeContextMenu();
        "
      >
        <span class="sidebar__context-menu-icon">
          <img :src="garbageIcon" />
        </span>
        <span class="sidebar__context-menu-text">삭제</span>
      </button>
    </div>
  </Teleport>

  <!-- =============== 우측 메뉴 (Context Menu) - 사용자 메뉴 =============== -->
  <Teleport to="body" v-if="userMenu.isVisible">
    <div class="sidebar__context-menu-overlay" />
    <div
      class="sidebar__context-menu"
      :style="{
        top: userMenu.position.top,
        left: userMenu.position.left,
      }"
    >
      <!-- 메뉴 항목: 로그아웃 -->
      <button class="sidebar__context-menu-item" @click="logout()">
        <span class="sidebar__context-menu-text">로그아웃</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * ========================================
 * MainSidebar.vue - 좌측 사이드바 컴포넌트
 * ========================================
 *
 * 기능:
 * 1. 채팅 목록 표시 및 관리
 * 2. 새 채팅 생성
 * 3. 채팅 검색
 * 4. 채팅 편집/삭제
 * 5. 사용자 정보 표시
 * 6. 로그아웃
 *
 * 반응형:
 * - Desktop (1024px 이상): 항상 표시
 * - Mobile (1024px 미만): 모달로 동작 (슬라이드 애니메이션)
 *
 * Props:
 * - is-open: 모바일에서 사이드바 열림 상태
 *
 * Emits:
 * - close: 사이드바 닫기 요청
 */

import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useConfigStore } from "@/stores/configStore";
import garbageIcon from "@/assets/images/icon/garbage.png";
import pencilIcon from "@/assets/images/icon/pencil.png";

/* ==================== Props & Emits ==================== */

/**
 * Props 정의
 *
 * is-open: 모바일에서 사이드바 표시 여부
 * - 부모(MainLayout.vue)에서 제어
 * - Desktop: 항상 true (표시 안 함, Grid로 표시)
 * - Mobile: 토글 가능
 */
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

/**
 * Emits 정의
 *
 * close: 사이드바 닫기 요청
 * - 모바일에서 사이드바 닫기 버튼 클릭
 * - 사이드바 외부(overlay) 클릭
 * - 메뉴 항목 선택 시
 */
const emit = defineEmits(["close"]);

/* ==================== 라우터 및 스토어 ==================== */
const router = useRouter();
const authStore = useAuthStore();
const configStore = useConfigStore();

/* ==================== 반응형 상태 (State) ==================== */

/**
 * isMobileView: 모바일 화면 여부
 *
 * 값:
 * - true: 1024px 미만 (모바일/태블릿)
 * - false: 1024px 이상 (데스크톱/랩톱)
 *
 * 용도:
 * - overlay 표시 여부 결정
 * - 모바일에서만 overlay와 애니메이션 표시
 */
const isMobileView = ref(false);

const searchQuery = ref("");
const activeChatId = ref(null);

const chatSections = ref([
  {
    id: "today",
    title: "오늘",
    chats: [
      { id: 1, title: "시나 erp 시스템 정의" },
      { id: 2, title: "ERP 도입 시 필연 구축시간 및 ..." },
      { id: 3, title: "입사 시 api설정 및 통합 점검 정의" },
    ],
  },
  {
    id: "recent",
    title: "최근",
    chats: [
      { id: 4, title: "시나 erp 시스템 정의" },
      { id: 5, title: "ERP 도입 시 필연 구축시간 및 ..." },
    ],
  },
]);

const contextMenu = ref({
  isVisible: false,
  chatId: null,
  position: { top: "0px", left: "0px" },
});

const userMenu = ref({
  isVisible: false,
  position: { top: "0px", left: "0px" },
});

const editingChatId = ref(null);
const editingTitle = ref("");

/* ==================== 계산된 속성 (Computed) ==================== */

const userName = computed(() => authStore.user?.name || "User");

const filteredChatSections = computed(() => {
  if (!searchQuery.value.trim()) {
    return chatSections.value;
  }

  const query = searchQuery.value.toLowerCase();

  return chatSections.value
    .map((section) => ({
      ...section,
      chats: section.chats.filter((chat) =>
        chat.title.toLowerCase().includes(query)
      ),
    }))
    .filter((section) => section.chats.length > 0);
});

/* ==================== 메서드 (Methods) ==================== */

/**
 * closeSidebar: 사이드바 닫기
 *
 * 부모 컴포넌트(MainLayout.vue)에 close 이벤트 발생
 * MainLayout에서 isSidebarOpen을 false로 설정
 */
const closeSidebar = () => {
  console.log("📱 Sidebar 닫기 요청");
  emit("close");
};

/**
 * startNewChat: 새 채팅 시작
 *
 * 동작:
 * 1. 새 ID 생성 (기존 채팅의 최대 ID + 1)
 * 2. 새 채팅 객체 생성
 * 3. "오늘" 섹션에 추가
 * 4. 새 채팅 선택 (activeChatId 업데이트)
 * 5. 검색어 초기화
 */
const startNewChat = () => {
  console.log("✨ 새 채팅 시작");

  const newChatId =
    Math.max(
      ...chatSections.value.flatMap((s) => s.chats.map((c) => c.id)),
      0
    ) + 1;

  const newChat = {
    id: newChatId,
    title: "새로운 채팅",
  };

  const todaySection = chatSections.value.find((s) => s.id === "today");
  if (todaySection) {
    todaySection.chats.unshift(newChat);
  }

  activeChatId.value = newChat.id;
  searchQuery.value = "";

  // 모바일: 새 채팅 후 Sidebar 자동 닫기
  if (isMobileView.value) {
    closeSidebar();
  }
};

/**
 * selectChat: 채팅 선택
 *
 * @param {Object} chat - 선택할 채팅 객체
 *
 * 동작:
 * 1. 선택한 채팅의 ID를 activeChatId로 설정
 * 2. 모바일: Sidebar 자동 닫기
 */
const selectChat = (chat) => {
  console.log("📖 채팅 선택:", chat.title);
  activeChatId.value = chat.id;

  // 모바일: 채팅 선택 후 Sidebar 자동 닫기
  if (isMobileView.value) {
    closeSidebar();
  }
};

/**
 * deleteChat: 채팅 삭제
 *
 * @param {number} chatId - 삭제할 채팅 ID
 *
 * 동작:
 * 1. 삭제 확인 대화
 * 2. 모든 섹션에서 해당 채팅 제거
 * 3. 삭제된 채팅이 활성 채팅이었다면 activeChatId 초기화
 */
const deleteChat = (chatId) => {
  console.log("🗑️ 채팅 삭제:", chatId);

  if (confirm("이 채팅을 삭제하시겠습니까?")) {
    chatSections.value = chatSections.value.map((section) => ({
      ...section,
      chats: section.chats.filter((chat) => chat.id !== chatId),
    }));

    if (activeChatId.value === chatId) {
      activeChatId.value = null;
    }
  }
};

const handleSearch = () => {
  console.log("🔍 검색:", searchQuery.value);
};

/**
 * logout: 로그아웃
 *
 * 동작:
 * 1. authStore에서 로그아웃
 * 2. /login 페이지로 라우팅
 */
const logout = () => {
  console.log("🚪 로그아웃");
  authStore.logout();
  router.push("/login");
};

/* ==================== Context Menu 메서드 ==================== */

const showContextMenu = (event, chatId) => {
  event.preventDefault();
  event.stopPropagation();

  console.log("📋 Context Menu 열기:", chatId);

  contextMenu.value = {
    isVisible: true,
    chatId: chatId,
    position: {
      top: `${event.pageY}px`,
      left: `${event.pageX}px`,
    },
  };
};

const closeContextMenu = () => {
  contextMenu.value.isVisible = false;
  contextMenu.value.chatId = null;
};

const startEditingChat = (chatId, currentTitle) => {
  console.log("✏️ 채팅 편집 시작:", chatId);

  editingChatId.value = chatId;
  editingTitle.value = currentTitle;
  closeContextMenu();

  nextTick(() => {
    const input = document.querySelector(
      `.sidebar__chat-edit-input[data-chat-id="${chatId}"]`
    );
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const saveEditingChat = (chatId) => {
  const newTitle = editingTitle.value.trim();

  if (!newTitle) {
    console.warn("⚠️ 제목이 비어있습니다");
    editingChatId.value = null;
    return;
  }

  console.log("💾 채팅 제목 저장:", chatId, newTitle);

  chatSections.value.forEach((section) => {
    const chat = section.chats.find((c) => c.id === chatId);
    if (chat) {
      chat.title = newTitle;
    }
  });

  editingChatId.value = null;
  editingTitle.value = "";
};

const cancelEditingChat = () => {
  console.log("❌ 채팅 편집 취소");
  editingChatId.value = null;
  editingTitle.value = "";
};

const handleChatTitleKeydown = (event, chatId) => {
  if (event.key === "Enter") {
    saveEditingChat(chatId);
  } else if (event.key === "Escape") {
    cancelEditingChat();
  }
};

/* ==================== 윈도우 리사이즈 감지 ==================== */

/**
 * handleWindowResize: 윈도우 리사이즈 시 모바일 여부 업데이트
 *
 * 1024px 기준:
 * - 1024px 이상: 데스크톱 (모바일 뷰 아님)
 * - 1024px 미만: 모바일/태블릿 (모바일 뷰)
 *
 * 역할:
 * - overlay 표시 여부 결정
 * - 모바일에서만 overlay와 애니메이션 활성화
 */
const handleWindowResize = () => {
  const windowWidth = window.innerWidth;
  isMobileView.value = windowWidth < 1024;

  console.log(
    `📐 윈도우 리사이즈: ${windowWidth}px → 모바일: ${isMobileView.value}`
  );
};

/* ==================== 라이프사이클 ==================== */

onMounted(() => {
  console.log("✅ MainSidebar 마운트됨");

  // 1️⃣ 초기 윈도우 크기 확인
  handleWindowResize();

  // 2️⃣ 리사이즈 리스너 등록
  window.addEventListener("resize", handleWindowResize);

  // 3️⃣ 문서 클릭 시 context menu 닫기
  document.addEventListener("click", () => {
    closeContextMenu();
  });

  console.log("✅ 이벤트 리스너 등록됨");
});

onUnmounted(() => {
  console.log("🗑️ MainSidebar 언마운트됨");
  window.removeEventListener("resize", handleWindowResize);
  document.removeEventListener("click", closeContextMenu);
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

/* ==================== Mobile Overlay ==================== */

/**
 * sidebar-overlay: 모바일에서만 표시되는 반투명 배경
 *
 * 역할:
 * - Sidebar 외부를 클릭할 때 닫히도록 함
 * - 반투명 배경으로 시각적 피드백
 * - z-index를 sidebar보다 낮게 설정 (sidebar 뒤)
 *
 * 동작:
 * - v-if="isMobileView && isOpen" → 모바일이면서 열려있을 때만 표시
 * - @click="closeSidebar" → 클릭 시 닫기
 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* 반투명 검은색 */
  z-index: 998; /* Sidebar(999)보다 아래 */
  animation: fadeIn 0.3s ease;
}

/* ==================== Sidebar 전체 구조 ==================== */

.sidebar {
  display: flex;
  flex-direction: column;
  width: 250px;
  height: 100vh;
  background-color: $white;
  border-right: 1px solid $gray-200;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  @media (max-width: 639px) {
    width: 75vw;
    max-width: 250px;
  }
  /* 기본: 왼쪽으로 숨김 */
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  overflow-y: auto;

  &--open {
    transform: translateX(0);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }

  /* ==================== 스크롤바 스타일 ==================== */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: $gray-300;
    border-radius: 3px;

    &:hover {
      background: $gray-400;
    }
  }

  /* ==================== Header  ==================== */
  &__header {
    padding: $spacing-5;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
  }

  /* ==================== Logo  ==================== */
  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--color-border-light);

    &-image {
      width: 63px;
      height: 33px;
      object-fit: contain;
      transition: all 0.3s ease;
      image-rendering: crisp-edges;
    }
  }

  /* ==================== New Chat Button ==================== */
  &__new-chat {
    &-btn {
      cursor: pointer;
      margin: 0 $spacing-6;
      margin-top: 18px;
      padding: $spacing-3 $spacing-4;
      border: 1px solid var(--primary-color);
      border-radius: 8px;
      background-color: transparent;
      color: var(--primary-color);
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      height: 35px;
      flex-shrink: 0;

      &:hover {
        background-color: var(--primary-color);
        color: $white;
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(208, 2, 27, 0.2);
      }

      &:active {
        transform: scale(0.98);
      }
    }

    &-text {
      font-size: 14px;
    }
  }

  /* ==================== History Section ==================== */
  &__history-section {
    margin-bottom: $spacing-4;

    &-title {
      font-size: 12px;
      font-weight: 600;
      color: $secondary-text;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
      margin-bottom: 16px;
    }
  }

  /* ==================== 검색창 ==================== */
  &__search {
    position: relative;
    margin: 32px 24px;
    flex-shrink: 0;

    &-input {
      width: 100%;
      padding-right: 30px;
      border: none;
      border-bottom: 2px solid #5d5d5d;
      border-radius: 0;
      background-color: transparent;
      font-size: 16px;
      color: #333;

      &::placeholder {
        color: #999;
      }

      &:focus {
        outline: none;
        border-bottom-color: var(--primary-color);
        animation: underlineExpand 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      &:not(:placeholder-shown) {
        border-bottom-color: #333;
      }
    }

    &-icon {
      position: absolute;
      right: $spacing-4;
      top: 50%;
      transform: translateY(-50%);
      color: $secondary-text;
      font-size: 16px;
      pointer-events: none;
    }
  }

  &__history {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-4 24px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: $gray-300;
      border-radius: 3px;

      &:hover {
        background: $gray-400;
      }
    }
  }
}

.sidebar__chat-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar__chat-item {
  padding: 8px 4px;
  color: $secondary-text;
  font-size: 14px;
  cursor: pointer;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-2;
  transition: all 0.2s ease;

  &:hover {
    background-color: $gray-50;
    color: $primary-text;
    animation: fadeInLeft 0.2s ease-out;
  }

  &--active {
    background-color: $gray-100;
    color: var(--primary-color);
    font-weight: 600;
    border-left: 3px solid var(--primary-color);
    padding-left: calc($spacing-4 - 3px);
  }
}

.sidebar__chat-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__chat-actions {
  display: none;
  gap: $spacing-2;
  flex-shrink: 0;

  .sidebar__chat-item:hover & {
    display: flex;
  }
}

.sidebar__chat-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 10px;
  padding: $spacing-1 $spacing-2;
  color: $secondary-text;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: $black;
    background-color: $white;
    transform: scale(1.2);
  }
}

/* ==================== 채팅 없을 때 ==================== */
.sidebar__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: $spacing-8;
}

.sidebar__empty-text {
  color: $secondary-text;
  font-size: 14px;
  text-align: center;
  margin: 0;
}

/* ==================== Footer (사용자 정보) ==================== */
.sidebar__footer {
  padding: $spacing-4;
  border-top: 1px solid $gray-100;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  flex-shrink: 0;
}

.sidebar__user-profile {
  background: none;
  border: none;
  cursor: pointer;
  padding: $spacing-2;
  border-radius: 8px;

  display: flex;
  align-items: center;
  gap: $spacing-3;

  transition: all 0.2s ease;

  &:hover {
    background-color: $gray-50;
  }

  &:active {
    background-color: $gray-100;
  }
}

.sidebar__user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.sidebar__user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $spacing-1;
}

.sidebar__user-name {
  font-weight: 600;
  font-size: 14px;
  color: $primary-text;
}

.sidebar__user-role {
  font-size: 12px;
  color: $secondary-text;
}

/* ==================== 제목 편집 입력 필드 ==================== */
.sidebar__chat-edit-input {
  flex: 1;
  border: none;
  border-bottom: 2px solid var(--primary-color);
  background: none;
  color: $primary-text;
  font-size: 14px;
  padding: 2px 0;

  &:focus {
    outline: none;
    border-bottom-color: var(--primary-color);
  }

  &::placeholder {
    color: $secondary-text;
  }
}

/* ==================== Context Menu ==================== */

.sidebar__context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-popover - 10;
}

.sidebar__context-menu {
  position: fixed;
  z-index: $z-popover;

  background-color: $white;
  border: 1px solid $gray-200;
  border-radius: $border-radius-md;
  box-shadow: $shadow-lg;

  padding: $spacing-2 0;

  animation: scaleIn 0.2s ease-out;

  min-width: 160px;
}

.sidebar__context-menu-item {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  color: $primary-text;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background-color: $gray-50;
    color: $primary-text;
  }

  &:active {
    background-color: $gray-100;
  }
}

.sidebar__context-menu-icon {
  font-size: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
}

.sidebar__context-menu-text {
  flex: 1;
  white-space: nowrap;
}
// 전역에서 사용하는 animation 보다 다른
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
