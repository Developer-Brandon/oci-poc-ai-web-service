<!--
  MainPage.vue
  
  메인 채팅 페이지 - 전체 레이아웃 구성
  
  구조:
  - Header: 상단바 (로고, 사용자 정보)
  - Sidebar: 좌측 사이드바 (채팅 히스토리, 새 채팅)
  - Main: 중앙 채팅 영역 (AgentCard, ChatMessage, ChatInput)
  
  반응형:
  - Desktop: 3단 레이아웃 (Header + Sidebar + Main)
  - Mobile: Sidebar는 토글로 숨김/표시
-->

<template>
  <div class="main-page">
    <!-- 헤더 영역 -->
    <Header @toggle-sidebar="handleToggleSidebar" @logout="handleLogout" />

    <div class="main-page__content">
      <!-- 사이드바 영역 -->
      <Sidebar
        :is-open="isSidebarOpen"
        @close="isSidebarOpen = false"
        @new-chat="handleNewChat"
        @select-chat="handleSelectChat"
      />

      <!-- 메인 콘텐츠 영역 -->
      <main class="main-content">
        <!-- 
          채팅 히스토리가 없을 때: 시작 화면 표시
          - AI Agent 선택 카드들
          - 추천 질문들
        -->
        <div class="welcome-screen">
          <div class="welcome-header">
            <h1 class="welcome-title">안녕하세요, {{ userName }}님! 👋</h1>
            <p class="welcome-subtitle">오늘은 어떤 업무를 도와드릴까요?</p>
          </div>

          <!-- AI Agent 카드 목록 -->
          <div class="agent-cards-grid">
            <AgentCard
              v-for="agent in agents"
              :key="agent.id"
              :agent="agent"
              :is-selected="selectedAgent?.id === agent.id"
              @select="handleSelectAgent"
            />
          </div>

          <!-- 추천 질문 -->
          <div class="suggested-questions">
            <h3 class="suggested-title">💡 이런 질문은 어떠세요?</h3>
            <div class="questions-grid">
              <button
                v-for="(question, index) in suggestedQuestions"
                :key="index"
                class="question-card"
                @click="handleQuestionClick(question)"
              >
                <span class="question-icon">{{ question.icon }}</span>
                <span class="question-text">{{ question.text }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 
          채팅 히스토리가 있을 때: 채팅 화면 표시
        -->
        <div class="chat-screen">
          <!-- 상단: 선택된 Agent 표시 -->
          <div class="chat-header">
            <div class="agent-info">
              <CommonIcon :src="selectedAgent?.icon" :size="24" />
              <div class="agent-details">
                <span class="agent-name">{{ selectedAgent?.name }}</span>
                <span class="agent-description">
                  {{ selectedAgent?.description }}
                </span>
              </div>
            </div>
            <span class="agent-carbon">
              🌿 탄소 {{ selectedAgent?.carbon }}g
            </span>
          </div>

          <!-- 중앙: 메시지 목록 -->
          <div class="messages-container" ref="messagesContainer">
            <ChatMessage
              v-for="message in messages"
              :key="message.id"
              :message="message"
              :agent="selectedAgent"
            />

            <!-- 로딩 인디케이터 -->
            <div v-if="isLoading" class="loading-indicator">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span class="loading-text">AI가 답변을 생성하고 있습니다...</span>
            </div>
          </div>

          <!-- 하단: 입력 필드 (고정) -->
          <div class="chat-input-wrapper">
            <ChatInput
              v-model="userInput"
              :disabled="isLoading"
              :selected-agent="selectedAgent"
              @send="handleSendMessage"
              @select-agent="handleSelectAgent"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
/**
 * MainPage - 메인 채팅 페이지
 *
 * 주요 기능:
 * 1. 전체 레이아웃 관리 (Header + Sidebar + Main)
 * 2. AI Agent 선택 상태 관리
 * 3. 채팅 메시지 상태 관리
 * 4. 사이드바 토글 (모바일)
 */

import { ref, computed, onMounted, nextTick } from "vue";
import { useAuthStore } from "@/stores/auth";
// import { useChatStore } from "@/stores/chat";
import Header from "@/components/common/Header.vue";
import Sidebar from "@/components/common/Sidebar.vue";
import AgentCard from "@/components/chat/AgentCard.vue";
import ChatMessage from "@/components/chat/ChatMessage.vue";
import ChatInput from "@/components/chat/ChatInput.vue";
import CommonIcon from "@/components/icon/CommonIcon.vue";

/* ==================== Stores ==================== */

const authStore = useAuthStore();
// const chatStore = useChatStore();

/* ==================== Refs ==================== */

// UI 상태
const isSidebarOpen = ref(true);
const isLoading = ref(false);
const userInput = ref("");
const messagesContainer = ref(null);

// 선택된 Agent (초기값: null, 사용자가 선택해야 함)
const selectedAgent = ref(null);

// AI Agent 목록 (임시 데이터, 추후 API로 변경)
const agents = ref([
  {
    id: "gpt5",
    name: "GPT-5",
    description: "복잡한 분석, 고난이도 작업에 유리한 모델",
    icon: "/icons/gpt5.png",
    carbon: 100,
    available: true,
  },
  {
    id: "sonnet4.5",
    name: "Sonnet 4.5",
    description: "높은 언어 이해로 일상적인 작업에 좋은 모델",
    icon: "/icons/sonnet.png",
    carbon: 80,
    available: true,
  },
  {
    id: "gpt4.1",
    name: "GPT-4.1",
    description: "빠른 속도와 안정적인 품질을 제공하는 모델",
    icon: "/icons/gpt4.png",
    carbon: 60,
    available: true,
  },
  {
    id: "gpt4",
    name: "GPT-4",
    description: "표준 업무, 반복 작업, 신뢰성 높은 모델",
    icon: "/icons/gpt4-legacy.png",
    carbon: 50,
    available: true,
  },
]);

// 추천 질문
const suggestedQuestions = ref([
  { icon: "📊", text: "Q3 실적 보고서 작성해줘" },
  { icon: "📧", text: "고객 미팅 안내 이메일 초안 작성" },
  { icon: "💡", text: "신규 프로젝트 아이디어 브레인스토밍" },
  { icon: "📝", text: "회의록 요약 및 액션 아이템 정리" },
]);

/* ==================== Computed ==================== */

/**
 * 사용자 이름 (환영 메시지용)
 */
const userName = computed(() => authStore.userName || "사용자");

/**
 * 채팅 메시지 (Pinia store에서 가져옴)
 */
// const messages = computed(() => chatStore.messages);

/**
 * 메시지가 있는지 여부
 */
// const hasMessages = computed(() => messages.value.length > 0);

/* ==================== Methods ==================== */

/**
 * 사이드바 토글 (모바일)
 */
function handleToggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

/**
 * 로그아웃
 */
function handleLogout() {
  authStore.logout();
  // 추후 router.push('/login')
  alert("로그아웃 되었습니다.");
}

/**
 * 새 채팅 시작
 */
function handleNewChat() {
  chatStore.clearMessages();
  selectedAgent.value = null;
  userInput.value = "";
  console.log("✅ 새 채팅 시작");
}

/**
 * 채팅 선택 (사이드바에서)
 */
function handleSelectChat(chatId) {
  // 추후 구현: 선택한 채팅의 메시지 불러오기
  console.log("채팅 선택:", chatId);
}

/**
 * Agent 선택
 */
function handleSelectAgent(agent) {
  selectedAgent.value = agent;
  console.log("✅ Agent 선택:", agent.name);
}

/**
 * 추천 질문 클릭
 */
function handleQuestionClick(question) {
  // Agent가 선택되지 않았으면 첫 번째 Agent 자동 선택
  if (!selectedAgent.value) {
    selectedAgent.value = agents.value[0];
  }

  userInput.value = question.text;

  // 자동으로 전송
  nextTick(() => {
    handleSendMessage();
  });
}

/**
 * 메시지 전송
 */
async function handleSendMessage() {
  // 입력값 검증
  if (!userInput.value.trim()) {
    return;
  }

  // Agent 선택 확인
  if (!selectedAgent.value) {
    alert("AI Agent를 먼저 선택해주세요.");
    return;
  }

  // 로딩 시작
  isLoading.value = true;

  try {
    // 사용자 메시지 추가
    await chatStore.addMessage({
      type: "user",
      content: userInput.value,
      agentId: selectedAgent.value.id,
    });

    // 입력 필드 초기화
    const messageToSend = userInput.value;
    userInput.value = "";

    // 메시지 전송 (API 호출)
    await chatStore.sendMessage(messageToSend, selectedAgent.value);

    // 스크롤을 맨 아래로
    scrollToBottom();
  } catch (error) {
    console.error("메시지 전송 실패:", error);
    alert("메시지 전송에 실패했습니다.");
  } finally {
    isLoading.value = false;
  }
}

/**
 * 스크롤을 맨 아래로
 */
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

/* ==================== Lifecycle ==================== */

onMounted(() => {
  // 저장된 채팅 불러오기 (추후 구현)
  chatStore.loadMessages();

  console.log("✅ MainPage 로드 완료");
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

/* ==================== 전체 페이지 레이아웃 ==================== */

.main-page {
  /**
   * 전체 화면을 차지하는 레이아웃
   * 
   * 구조:
   * - Header (고정 높이)
   * - Content (나머지 높이)
   */
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: $bg-primary;
  overflow: hidden;
}

.main-page__content {
  /**
   * Header 아래의 콘텐츠 영역
   * 
   * flex: 1로 남은 공간 모두 차지
   * Sidebar + Main으로 구성
   */
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ==================== 메인 콘텐츠 영역 ==================== */

.main-content {
  /**
   * 중앙 채팅 영역
   * 
   * flex: 1로 Sidebar 옆의 남은 공간 모두 차지
   */
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: $bg-primary;
}

/* ==================== 환영 화면 (채팅 없을 때) ==================== */

.welcome-screen {
  /**
   * 시작 화면
   * 
   * 스크롤 가능하도록 설정
   */
  flex: 1;
  overflow-y: auto;
  padding: $spacing-10 $spacing-8;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: $gray-300;
    border-radius: $border-radius-full;
  }
}

.welcome-header {
  /**
   * 환영 메시지 헤더
   */
  text-align: center;
  margin-bottom: $spacing-10;
  animation: fadeInDown 0.6s ease-out;
}

.welcome-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-3;
}

.welcome-subtitle {
  font-size: $font-size-lg;
  color: $text-secondary;
}

/* ==================== Agent 카드 그리드 ==================== */

.agent-cards-grid {
  /**
   * Agent 카드들을 그리드로 배치
   * 
   * 반응형:
   * - Desktop: 4열
   * - Tablet: 2열
   * - Mobile: 1열
   */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-6;
  margin-bottom: $spacing-10;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

/* ==================== 추천 질문 ==================== */

.suggested-questions {
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

.suggested-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-6;
  text-align: center;
}

.questions-grid {
  /**
   * 추천 질문들을 그리드로 배치
   */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: $spacing-4;
}

.question-card {
  /**
   * 추천 질문 카드
   * 
   * 클릭하면 해당 질문이 입력 필드에 자동 입력
   */
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-5 $spacing-6;
  background-color: $white;
  border: 2px solid $gray-200;
  border-radius: $border-radius-lg;
  cursor: pointer;
  transition: all $transition-base;
  text-align: left;

  /* 호버 효과 */
  &:hover {
    border-color: $primary-color;
    background-color: rgba($primary-color, 0.05);
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  /* 클릭 효과 */
  &:active {
    transform: translateY(0);
  }
}

.question-icon {
  font-size: $font-size-2xl;
  flex-shrink: 0;
}

.question-text {
  font-size: $font-size-base;
  color: $text-primary;
  font-weight: $font-weight-medium;
}

/* ==================== 채팅 화면 ==================== */

.chat-screen {
  /**
   * 채팅 화면 레이아웃
   * 
   * 구조:
   * - chat-header (고정)
   * - messages-container (스크롤)
   * - chat-input-wrapper (고정)
   */
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  /**
   * 상단: 선택된 Agent 정보 표시
   */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-4 $spacing-6;
  background-color: $white;
  border-bottom: 1px solid $gray-200;
  animation: fadeInDown 0.3s ease-out;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.agent-details {
  display: flex;
  flex-direction: column;
}

.agent-name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.agent-description {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.agent-carbon {
  font-size: $font-size-sm;
  color: $success-color;
  font-weight: $font-weight-medium;
}

/* ==================== 메시지 컨테이너 ==================== */

.messages-container {
  /**
   * 메시지 목록
   * 
   * 스크롤 가능, 남은 공간 모두 차지
   */
  flex: 1;
  overflow-y: auto;
  padding: $spacing-6;
  background-color: $bg-secondary;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: $gray-300;
    border-radius: $border-radius-full;
  }
}

/* ==================== 로딩 인디케이터 ==================== */

.loading-indicator {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-5;
  animation: fadeInUp 0.3s ease-out;
}

.loading-dots {
  display: flex;
  gap: $spacing-xs;

  span {
    width: 8px;
    height: 8px;
    background-color: $primary-color;
    border-radius: 50%;
    animation: bounce 1s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

.loading-text {
  font-size: $font-size-sm;
  color: $text-secondary;
}

/* ==================== 입력 필드 래퍼 ==================== */

.chat-input-wrapper {
  /**
   * 하단: 입력 필드 (고정)
   */
  padding: $spacing-6;
  background-color: $white;
  border-top: 1px solid $gray-200;
}

/* ==================== 반응형 ==================== */

@media (max-width: $breakpoint-tablet) {
  .welcome-screen {
    padding: $spacing-6 $spacing-4;
  }

  .agent-cards-grid {
    grid-template-columns: 1fr;
  }

  .questions-grid {
    grid-template-columns: 1fr;
  }

  .messages-container {
    padding: $spacing-4;
  }

  .chat-input-wrapper {
    padding: $spacing-4;
  }
}
</style>
