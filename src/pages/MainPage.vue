<!-- src/components/main/MainPage.vue -->
<template>
  <!-- 메인 콘텐츠 영역 -->
  <main class="main-content">
    <!-- ==================== 1. 인사말 영역 ==================== -->
    <section class="greeting-section">
      <div class="greeting-container no-drag">
        <!-- 제목 영역: 동적으로 서버에서 받은 인사말 텍스트 렌더링 -->
        <h1 class="greeting-title">
          안녕하세요. <span class="user-name">{{ authStore.userName }}</span
          >님!
        </h1>
        <!-- 설명 텍스트 영역: 부드러운 아래쪽 애니메이션으로 진입 -->
        <p class="greeting-description">오늘은 어떤 업무를 시작해볼까요?</p>
      </div>
    </section>

    <!-- ==================== 2. 에이전트 카드 영역 ==================== -->
    <section class="card-list-section no-drag">
      <div class="card-list-section__greeting">
        <p class="card-list-section__greeting__text">
          <span class="grow-anim">✨</span>자주 사용하는 AI Agent
        </p>
      </div>

      <div class="card-list-section__inner">
        <AgentCard
          :cardIndex="0"
          type="normal"
          @agent-select="handleAgentSelect"
        />
        <AgentCard
          :cardIndex="1"
          type="normal"
          @agent-select="handleAgentSelect"
        />
        <AgentCard
          :cardIndex="2"
          type="faq"
          @agent-select="handleAgentSelect"
        />
      </div>
    </section>

    <!-- ==================== 3. 채팅 입력 영역 ==================== -->
    <section class="chat-section">
      <ChatInputField
        v-model="chatMessage"
        :attached-files="attachedFiles"
        @send="handleSend"
        @attach-file="handleAttachFile"
        @remove-file="handleRemoveFile"
      />
    </section>
  </main>
</template>

<script setup>
/**
 * MainPage.vue - 메인 페이지 콘텐츠
 *
 * 구조:
 * 1. 인사말 섹션
 * 2. AI Agent 카드 섹션 (3개 카드)
 * 3. 채팅 입력 섹션
 *
 * 각 섹션은 max-width로 제한되어 큰 화면에서도 가독성이 좋습니다
 */

import { onMounted, ref } from "vue";
import AgentCard from "@/components/main/card/AgentCard.vue";
import ChatInputField from "@/components/chat/ChatInputField.vue";
import { useConfigStore } from "@/stores/configStore";
import { useAuthStore } from "@/stores/auth";

/* ==================== 반응형 상태 ==================== */

const chatMessage = ref("");
const attachedFiles = ref([]);

const configStore = useConfigStore();
const authStore = useAuthStore();
/* ==================== 메서드 ==================== */

const handleSend = ({ message, files }) => {
  // TODO: 서버 API 호출
  console.log("📤 전송:", message, files);
  chatMessage.value = "";
  attachedFiles.value = [];
};

const handleAttachFile = (files) => {
  attachedFiles.value.push(...files);
};

const handleRemoveFile = (idx) => {
  attachedFiles.value.splice(idx, 1);
};

onMounted(() => {
  console.log("✅ MainPage 마운트됨");
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

/* ==================== 메인 콘텐츠 영역 ==================== */

/**
 * .main-content: 전체 콘텐츠 컨테이너
 * 
 * 레이아웃 원칙:
 * 1. flex 컨테이너로 설정 (세로 배치)
 * 2. padding으로 좌우 여백 추가
 * 3. max-width로 최대 너비 제한 (큰 화면에서도 가독성)
 * 4. margin: 0 auto로 중앙 정렬
 * 
 * 반응형:
 * - 데스크톱 (>1200px): padding 3rem 1rem
 * - 태블릿 (768px~1200px): padding 2rem 1rem
 * - 모바일 (<768px): padding 1.5rem 1rem
 */
.main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 3rem 1rem; /* 상하: 48px, 좌우: 16px */
  max-width: 1200px; /* 최대 너비: 1200px */
  margin: 0 auto; /* 중앙 정렬 */

  /* 반응형: 노트북: 1441px ~ 1920px */
  @media (min-width: 1441px) and (max-width: 1920px) {
    padding: 1rem 0.5rem;
  }

  /* 반응형: 태블릿 (768px ~ 1024px) */
  @media (max-width: 1024px) {
    padding: 2rem 1rem;
    max-width: 100%;
  }

  /* 반응형: 모바일 (<768px) */
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    gap: $spacing-6; /* 섹션 간 간격 축소: 24px */
  }
}

/* ==================== 인사말 섹션 ==================== */

/**
 * .greeting-section: 인사말 영역
 * 
 * 애니메이션:
 * - fadeInDown 1s: 위에서 아래로 부드럽게 나타남
 * 
 * 여백:
 * - margin-bottom: 3rem (에이전트 카드와의 거리)
 */
.greeting-section {
  animation: fadeInDown 1s ease-out;
  margin-bottom: 1rem;
  /* 반응형 */
  @media (min-width: 1441px) and (max-width: 1920px) {
    //
  }
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }

  /* 인사말 영역 기본 레이아웃 */
  .greeting-container {
    display: flex;
    flex-direction: column;
    gap: 0.875rem; /* 16px 정도의 간격 */
    margin-top: 4rem;
    margin-bottom: 6rem; /* 에이전트 카드와의 거리 */
    text-align: center;
    cursor: default;
    user-select: none;
    /* 반응형: 노트북: 1441px ~ 1920px */
    @media (min-width: 1441px) and (max-width: 1920px) {
      margin-top: 3rem;
      margin-bottom: 1.5rem; /* 에이전트 카드와의 거리 */
    }
    @media (max-width: 768px) {
      margin-top: 2.5rem;
      margin-bottom: 0.5rem;
    }
  }

  /* 큰 제목 스타일 */
  .greeting-title {
    font-size: 2.5rem; /* 32px */
    font-weight: 350;
    color: $primary-text;
    margin: 0;
    letter-spacing: -0.02em; /* 타이포그래피 개선 */
    transition: color 0.3s ease; /* 트렌디한 hover 효과 */
    @media (min-width: 1441px) and (max-width: 1920px) {
      font-size: 2rem; /* 32px */
    }
    .user-name {
      color: var(--primary-color);
      animation: textGlow 1.5s ease-in-out infinite; // 3s → 1.5s
    }
  }
  /* 설명 텍스트 스타일 */
  .greeting-description {
    font-size: 1.2rem; /* 16px */
    font-weight: 400;
    color: $secondary-text;
    margin: 0;
    line-height: 1.5;
    opacity: 0.8;
    transition: opacity 0.3s ease; /* 부드러운 색상 전환 */
    @media (min-width: 1441px) and (max-width: 1920px) {
      font-size: 1rem;
    }
    &:hover {
      opacity: 1;
    }
  }
}

/* ==================== 에이전트 카드 섹션 ==================== */

/**
 * .card-list-section: 카드 영역 전체
 * 
 * 구조:
 * - card-list-section__greeting: 제목 영역
 * - card-list-section__inner: 카드 컨테이너
 * 
 * 애니메이션:
 * - fadeInDown 2s: 인사말보다 천천히 나타남 (시간차 효과)
 * 
 * 여백:
 * - margin-bottom: 120px (채팅 영역과의 거리)
 */
.card-list-section {
  animation: fadeInDown 2s ease-out;
  margin-bottom: 5rem;

  /* 반응형 */
  @media (min-width: 1441px) and (max-width: 1920px) {
    margin-bottom: 1.5rem;
  }
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
}

/**
 * .card-list-section__greeting: 제목 영역
 * 
 * 구조:
 * - 최대 너비 984px (카드 영역과 동일)
 * - 좌측 정렬
 * - 중앙 정렬 (margin: 0 auto)
 * 
 * 목적:
 * - "자주 사용하는 AI Agent" 제목 표시
 * - 이모지 애니메이션 (grow-anim)
 */
.card-list-section__greeting {
  width: 100%;
  max-width: 984px;
  margin: 0 auto $spacing-6;
  color: $primary-text;

  &__text {
    text-align: left;
    font-size: 1.5rem;
    font-weight: 500;
    margin: 0;
    display: flex;
    align-items: center;
    gap: $spacing-3;

    /* 반응형 */
    @media (min-width: 1441px) and (max-width: 1920px) {
      font-size: 1.25rem;
    }
    @media (max-width: 768px) {
      font-size: 20px;
    }
  }

  /* 이모지 반짝반짝 애니메이션 */
  .grow-anim {
    display: inline-block;
    animation: textGlow 1s ease-in-out infinite;
  }
}

/**
 * .card-list-section__inner: 카드 컨테이너
 * 
 * 레이아웃:
 * - display: flex (가로 배치)
 * - gap: 24px (카드 간 간격)
 * - justify-content: center (중앙 정렬)
 * - align-items: stretch (높이 균일)
 * - flex-wrap: nowrap (줄바꿈 금지)
 * 
 * 최대 너비:
 * - 3개 카드 + 간격을 고려한 984px
 * 
 * 반응형:
 * - 태블릿: flex-wrap: wrap (줄바꿈 허용)
 * - 모바일: 1개씩 배치
 */
.card-list-section__inner {
  display: flex;
  gap: 24px;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;

  width: 100%;
  max-width: 1064px; /* 3개 카드 최적 너비 */
  margin: 0 auto;

  /* 반응형: 태블릿 (1024px 이하) */
  @media (max-width: 1024px) {
    gap: 20px;
    max-width: 100%;
  }

  /* 반응형: 모바일 (768px 이하) */
  @media (max-width: 768px) {
    gap: 16px;
    flex-direction: column;

    /* 모바일에서 각 카드를 100% 너비로 설정 */
    > * {
      width: 100%;
    }
  }
}

/* ==================== 채팅 입력 섹션 ==================== */

/**
 * .chat-section: 채팅 입력 영역
 * 
 * 구조:
 * - ChatInputField 컴포넌트를 감싸는 컨테이너
 * - max-width: 1064px (카드 영역과 동일)
 * - margin: 3rem auto 0 (상단 여백 + 중앙 정렬)
 * 
 * 목적:
 * - 사용자가 AI에게 질문을 입력할 수 있는 영역
 * - 파일 첨부 기능 포함
 */
.chat-section {
  max-width: 1064px;
  width: 100%;
  margin: 3rem auto 0;

  /* 반응형 */
  @media (max-width: 768px) {
    margin: 2rem auto 0;
  }
}

/* 부드러운 진입 애니메이션 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
