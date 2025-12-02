<!--
  AgentCard.vue
  
  AI Agent를 카드 형태로 표시하는 컴포넌트
  메인 페이지의 "자주 사용하는 AI Agent" 섹션에서 사용됩니다.
  
  Props:
  - agent: Agent 정보 객체
    {
      id: string,
      name: string,
      description: string,
      icon: string (emoji 또는 이미지 URL),
      usage: number (사용량, 0-100),
      maxUsage: number (최대 사용량, 기본 100)
    }
  - selected: 현재 선택된 Agent인지 여부 (boolean)
  
  Events:
  - select: 카드 클릭 시 발생 (agent 객체 전달)
  
  사용 예시:
  <AgentCard
    :agent="agentData"
    :selected="currentAgent?.id === agentData.id"
    @select="handleSelectAgent"
  />
-->

<template>
  <!-- 
    Agent 카드 컨테이너
    
    :class 바인딩:
    - 'selected': 현재 선택된 Agent면 활성화 스타일 적용
    - 'disabled': 사용량이 0이면 비활성화
  -->
  <div
    class="agent-card"
    :class="{
      'agent-card--selected': selected,
      'agent-card--disabled': isDisabled,
    }"
    @click="handleClick"
  >
    <!-- 
      상단: Agent 아이콘 영역
      
      아이콘은 emoji 또는 이미지 URL을 지원합니다.
    -->
    <div class="agent-card__icon">
      <!-- 이미지 URL인 경우 -->
      <img
        v-if="isImageIcon"
        :src="agent.icon"
        :alt="`${agent.name} 아이콘`"
        class="agent-card__icon-image"
      />

      <!-- Emoji인 경우 -->
      <span v-else class="agent-card__icon-emoji">
        {{ agent.icon }}
      </span>
    </div>

    <!-- 
      중앙: Agent 이름 및 설명
    -->
    <div class="agent-card__content">
      <h3 class="agent-card__name">{{ agent.name }}</h3>
      <p class="agent-card__description">{{ agent.description }}</p>
    </div>

    <!-- 
      하단: 사용량 표시
      
      "100/100" 형태로 표시
      사용량이 0이면 "사용 불가" 표시
    -->
    <div class="agent-card__usage">
      <span v-if="!isDisabled" class="agent-card__usage-text">
        {{ agent.usage }}/{{ agent.maxUsage }}
      </span>
      <span
        v-else
        class="agent-card__usage-text agent-card__usage-text--disabled"
      >
        사용 불가
      </span>

      <!-- 
        사용량 프로그레스 바
      -->
      <div class="agent-card__progress">
        <div
          class="agent-card__progress-bar"
          :style="{ width: `${usagePercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- 
      선택 표시 (체크 아이콘)
      
      선택된 Agent일 때만 표시
    -->
    <div v-if="selected" class="agent-card__selected-badge">
      <span class="agent-card__check-icon">✓</span>
    </div>
  </div>
</template>

<script setup>
/**
 * Vue3 <script setup>로 작성된 AgentCard 컴포넌트
 *
 * Props 정의, Computed 속성, 이벤트 핸들러 포함
 */

import { computed } from "vue";

/* ==================== Props ==================== */

const props = defineProps({
  /**
   * Agent 정보 객체
   *
   * 구조:
   * {
   *   id: string,
   *   name: string,
   *   description: string,
   *   icon: string,
   *   usage: number,
   *   maxUsage: number
   * }
   */
  agent: {
    type: Object,
    required: true,
    validator: (value) => {
      // 필수 속성 검증
      return (
        value.id &&
        value.name &&
        value.description !== undefined &&
        value.icon &&
        value.usage !== undefined &&
        value.maxUsage !== undefined
      );
    },
  },

  /**
   * 현재 선택된 Agent인지 여부
   */
  selected: {
    type: Boolean,
    default: false,
  },
});

/* ==================== Emits ==================== */

const emit = defineEmits(["select"]);

/* ==================== Computed ==================== */

/**
 * 아이콘이 이미지 URL인지 확인
 *
 * http:// 또는 https://로 시작하면 이미지 URL로 간주
 */
const isImageIcon = computed(() => {
  return /^https?:\/\//.test(props.agent.icon);
});

/**
 * 사용량 퍼센티지 계산
 *
 * 프로그레스 바 너비를 계산하는 데 사용
 */
const usagePercentage = computed(() => {
  if (props.agent.maxUsage === 0) return 0;
  return Math.min((props.agent.usage / props.agent.maxUsage) * 100, 100);
});

/**
 * 비활성화 상태 확인
 *
 * 사용량이 0이면 비활성화
 */
const isDisabled = computed(() => {
  return props.agent.usage === 0;
});

/* ==================== Methods ==================== */

/**
 * 카드 클릭 핸들러
 *
 * 비활성화 상태가 아니면 select 이벤트 발생
 */
function handleClick() {
  if (isDisabled.value) {
    return;
  }

  emit("select", props.agent);
}
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

/* ==================== 카드 컨테이너 ==================== */

.agent-card {
  /* 
    카드 기본 스타일
    
    flex를 사용하여 내용을 수직 배치
  */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-4;

  /* 
    크기 및 패딩
  */
  width: 280px;
  min-height: 320px;
  padding: $spacing-6;

  /* 
    배경 및 테두리
  */
  background-color: $white;
  border: 2px solid $gray-200;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-sm;

  /* 
    커서 및 전환 효과
  */
  cursor: pointer;
  transition: all $transition-base;

  /* 
    상대 위치 (선택 배지용)
  */
  position: relative;

  /* 
    등장 애니메이션
  */
  animation: scaleIn 0.4s ease-out;

  /* 
    호버 효과: 확대 + 그림자 증가
  */
  &:hover:not(&--disabled) {
    transform: translateY(-8px) scale(1.02);
    box-shadow: $shadow-lg;
    border-color: $primary-light-color;
  }

  /* 
    액티브 효과: 클릭 시 살짝 축소
  */
  &:active:not(&--disabled) {
    transform: translateY(-4px) scale(1);
  }

  /* 
    선택된 상태
    
    보라색 테두리 + 배경색 변경
  */
  &--selected {
    border-color: $primary-color;
    background: linear-gradient(
      135deg,
      rgba($primary-color, 0.05) 0%,
      rgba($primary-light-color, 0.02) 100%
    );
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);

    /* 
      선택된 상태에서 호버 시 더 강조
    */
    &:hover {
      box-shadow: 0 0 0 3px rgba($primary-color, 0.2), $shadow-xl;
    }
  }

  /* 
    비활성화 상태
    
    흐린 색상 + 클릭 불가
  */
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: $gray-300;

    /* 
      비활성화 시 호버/액티브 효과 제거
    */
    &:hover,
    &:active {
      transform: none;
      box-shadow: $shadow-sm;
      border-color: $gray-300;
    }
  }
}

/* ==================== 아이콘 영역 ==================== */

.agent-card__icon {
  /* 
    아이콘 컨테이너
    
    원형 배경에 아이콘 표시
  */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(
    135deg,
    $primary-light-color 0%,
    $primary-color 100%
  );
  border-radius: 50%;
  box-shadow: $shadow-md;
  transition: all $transition-base;

  /* 
    호버 시 회전 애니메이션
  */
  .agent-card:hover:not(.agent-card--disabled) & {
    transform: rotate(10deg) scale(1.1);
  }
}

.agent-card__icon-image {
  /* 
    이미지 아이콘 스타일
  */
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.agent-card__icon-emoji {
  /* 
    Emoji 아이콘 스타일
  */
  font-size: $font-size-4xl;
}

/* ==================== 콘텐츠 영역 ==================== */

.agent-card__content {
  /* 
    이름 및 설명을 담는 영역
    
    중앙 정렬
  */
  text-align: center;
  flex: 1;
}

.agent-card__name {
  /* 
    Agent 이름
  */
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-2;

  /* 
    말줄임 처리 (1줄)
  */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-card__description {
  /* 
    Agent 설명
  */
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.6;

  /* 
    말줄임 처리 (2줄)
  */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ==================== 사용량 영역 ==================== */

.agent-card__usage {
  /* 
    사용량 정보 영역
    
    전체 너비 사용
  */
  width: 100%;
}

.agent-card__usage-text {
  /* 
    사용량 텍스트 (100/100)
  */
  display: block;
  font-size: $font-size-sm;
  color: $text-secondary;
  text-align: right;
  margin-bottom: $spacing-1;
  font-weight: $font-weight-medium;

  /* 
    비활성화 상태: 빨간색
  */
  &--disabled {
    color: $danger-color;
  }
}

.agent-card__progress {
  /* 
    프로그레스 바 배경
  */
  width: 100%;
  height: 6px;
  background-color: $gray-200;
  border-radius: $border-radius-full;
  overflow: hidden;
}

.agent-card__progress-bar {
  /* 
    프로그레스 바 (실제 사용량)
    
    너비는 usagePercentage로 동적 설정
  */
  height: 100%;
  background: linear-gradient(
    90deg,
    $primary-color 0%,
    $primary-light-color 100%
  );
  border-radius: $border-radius-full;
  transition: width $transition-base;

  /* 
    프로그레스 바 애니메이션
  */
  animation: slideRight 0.6s ease-out;
}

/* ==================== 선택 배지 ==================== */

.agent-card__selected-badge {
  /* 
    선택된 Agent 표시 배지
    
    우측 상단에 배치
  */
  position: absolute;
  top: $spacing-3;
  right: $spacing-3;
  width: 32px;
  height: 32px;
  background: linear-gradient(
    135deg,
    $primary-color 0%,
    $primary-dark-color 100%
  );
  border-radius: 50%;
  box-shadow: $shadow-md;

  /* 
    중앙 정렬
  */
  display: flex;
  align-items: center;
  justify-content: center;

  /* 
    등장 애니메이션
  */
  animation: scaleIn 0.3s ease-out;
}

.agent-card__check-icon {
  /* 
    체크 아이콘 (✓)
  */
  color: $white;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
}

/* ==================== 반응형 ==================== */

@media (max-width: $breakpoint-tablet) {
  .agent-card {
    /* 
      태블릿: 카드 너비 축소
    */
    width: 240px;
    min-height: 280px;
  }

  .agent-card__icon {
    width: 64px;
    height: 64px;
  }

  .agent-card__icon-emoji {
    font-size: $font-size-3xl;
  }
}

@media (max-width: $breakpoint-phone) {
  .agent-card {
    /* 
      모바일: 전체 너비 사용
    */
    width: 100%;
    min-height: auto;
  }
}
</style>
