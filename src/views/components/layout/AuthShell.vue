<template>
  <div class="auth-shell">
    <div class="auth-shell__backdrop">
      <div class="auth-shell__aurora auth-shell__aurora--left"></div>
      <div class="auth-shell__aurora auth-shell__aurora--right"></div>
      <div class="auth-shell__mesh"></div>
      <div class="auth-shell__noise"></div>
    </div>

    <header class="auth-shell__topbar">
      <router-link to="/" class="auth-shell__brand">
        <img class="auth-shell__brand-mark" :src="brandMark" alt="halo coding do" />
        <div class="auth-shell__brand-copy">
          <span class="auth-shell__brand-name">halo coding do</span>
          <span class="auth-shell__brand-caption">tasteful dev community</span>
        </div>
      </router-link>
    </header>

    <main class="auth-shell__main">
      <section class="auth-shell__panel" :style="panelStyle">
        <span v-if="eyebrow" class="auth-shell__eyebrow">{{ eyebrow }}</span>
        <h1 class="auth-shell__title">{{ title }}</h1>
        <p v-if="subtitle" class="auth-shell__subtitle">{{ subtitle }}</p>
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import brandMark from '@/assets/brand/hcd-mark.svg'

const props = defineProps({
  eyebrow: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  panelWidth: {
    type: [Number, String],
    default: 460
  }
})

const panelStyle = computed(() => {
  const width = typeof props.panelWidth === 'number' ? `${props.panelWidth}px` : props.panelWidth
  return {
    maxWidth: width
  }
})
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  min-height: 100svh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(16, 185, 129, 0.08), transparent 34%),
    linear-gradient(180deg, #05080d 0%, #080c12 48%, #06090f 100%);
}

.auth-shell__backdrop,
.auth-shell__aurora,
.auth-shell__mesh,
.auth-shell__noise {
  position: absolute;
  inset: 0;
}

.auth-shell__backdrop {
  pointer-events: none;
}

.auth-shell__aurora {
  filter: blur(120px);
  opacity: 0.8;
}

.auth-shell__aurora--left {
  top: -18%;
  left: -10%;
  width: 36rem;
  height: 36rem;
  background: rgba(16, 185, 129, 0.12);
}

.auth-shell__aurora--right {
  top: 28%;
  right: -12%;
  width: 32rem;
  height: 32rem;
  background: rgba(6, 182, 212, 0.08);
}

.auth-shell__mesh {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.18));
  opacity: 0.16;
}

.auth-shell__noise {
  opacity: 0.05;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.4) 0 1px, transparent 1px),
    radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.3) 0 1px, transparent 1px),
    radial-gradient(circle at 40% 70%, rgba(255, 255, 255, 0.35) 0 1px, transparent 1px);
  background-size: 160px 160px;
}

.auth-shell__topbar {
  position: relative;
  z-index: 1;
  padding: 28px 36px 0;
}

.auth-shell__brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: inherit;
  text-decoration: none;
}

.auth-shell__brand-mark {
  width: 44px;
  height: 38px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.auth-shell__brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.auth-shell__brand-name {
  color: rgba(255, 255, 255, 0.96);
  font-family: var(--font-display);
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1;
}

.auth-shell__brand-caption {
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.auth-shell__main {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 66px);
  min-height: calc(100svh - 66px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px 24px 40px;
}

.auth-shell__panel {
  width: min(100%, 100%);
  padding: 28px 0 0;
}

.auth-shell__eyebrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: fit-content;
  margin: 0 auto 18px;
  color: rgba(16, 185, 129, 0.84);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.auth-shell__eyebrow::before {
  content: '';
  width: 26px;
  height: 1px;
  background: rgba(16, 185, 129, 0.45);
}

.auth-shell__title {
  margin: 0;
  color: #f7fafc;
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.06em;
  text-align: center;
}

.auth-shell__subtitle {
  margin: 14px auto 30px;
  max-width: 30rem;
  color: rgba(226, 232, 240, 0.58);
  font-size: 0.98rem;
  line-height: 1.75;
  text-align: center;
}

:deep(.auth-form) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.field-group) {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

:deep(.field-label) {
  color: rgba(226, 232, 240, 0.62);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

:deep(.field-group.focused .field-label),
:deep(.field-group.filled .field-label) {
  color: rgba(248, 250, 252, 0.92);
}

:deep(.field-group.error .field-label) {
  color: #f87171;
}

:deep(.field-box) {
  position: relative;
}

:deep(.field-icon) {
  position: absolute;
  top: 50%;
  left: 18px;
  transform: translateY(-50%);
  color: rgba(148, 163, 184, 0.62);
  pointer-events: none;
  transition: color var(--transition-fast), opacity var(--transition-fast);
}

:deep(.field-group.focused .field-icon),
:deep(.field-group.filled .field-icon) {
  color: rgba(248, 250, 252, 0.82);
}

:deep(.field-group.error .field-icon) {
  color: #f87171;
}

:deep(.field-box input) {
  width: 100%;
  height: 60px;
  padding: 0 56px 0 50px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
  color: #f8fafc;
  font-size: 1rem;
  outline: none;
  transition:
    border-color var(--transition-base),
    background-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-fast);
}

:deep(.field-box input::placeholder) {
  color: rgba(148, 163, 184, 0.58);
}

:deep(.field-box input:hover) {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.058);
}

:deep(.field-box input:focus) {
  border-color: rgba(16, 185, 129, 0.48);
  background: rgba(255, 255, 255, 0.075);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

:deep(.field-group.error .field-box input) {
  border-color: rgba(248, 113, 113, 0.42);
  box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.08);
}

:deep(.toggle-password) {
  position: absolute;
  top: 50%;
  right: 12px;
  width: 36px;
  height: 36px;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: rgba(148, 163, 184, 0.74);
  cursor: pointer;
  transition: all var(--transition-fast);
}

:deep(.toggle-password:hover) {
  color: rgba(248, 250, 252, 0.92);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.password-strength) {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.strength-bar) {
  flex: 1;
  height: 5px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

:deep(.strength-fill) {
  height: 100%;
  border-radius: 999px;
  transition: width var(--transition-base);
}

:deep(.strength-fill.super-weak) {
  background: linear-gradient(90deg, #ef4444, #f97316);
}

:deep(.strength-fill.weak) {
  background: linear-gradient(90deg, #fb7185, #f59e0b);
}

:deep(.strength-fill.okay) {
  background: linear-gradient(90deg, #f59e0b, #eab308);
}

:deep(.strength-fill.awesome) {
  background: linear-gradient(90deg, #10b981, #06b6d4);
}

:deep(.strength-label) {
  min-width: 60px;
  text-align: right;
  font-size: 0.76rem;
  font-weight: 700;
}

:deep(.strength-label.super-weak) {
  color: #f87171;
}

:deep(.strength-label.weak) {
  color: #fb7185;
}

:deep(.strength-label.okay) {
  color: #fbbf24;
}

:deep(.strength-label.awesome) {
  color: #34d399;
}

:deep(.error-message) {
  color: #f87171;
  font-size: 0.78rem;
  line-height: 1.5;
}

:deep(.submit-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 58px;
  margin-top: 8px;
  border: 1px solid rgba(16, 185, 129, 0.18);
  border-radius: 18px;
  background: linear-gradient(135deg, #0c5a39 0%, #126d49 100%);
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    border-color var(--transition-fast),
    opacity var(--transition-fast);
  box-shadow: 0 18px 40px rgba(5, 150, 105, 0.18);
}

:deep(.submit-btn:hover:not(:disabled)) {
  transform: translateY(-1px);
  border-color: rgba(52, 211, 153, 0.36);
  box-shadow: 0 20px 44px rgba(5, 150, 105, 0.22);
}

:deep(.submit-btn:disabled) {
  opacity: 0.62;
  cursor: not-allowed;
  box-shadow: none;
}

:deep(.loading-spinner) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.loading-spinner svg) {
  animation: auth-spin 1s linear infinite;
}

@keyframes auth-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

:deep(.panel-footer) {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 18px;
  color: rgba(226, 232, 240, 0.5);
  font-size: 0.9rem;
}

:deep(.footer-link) {
  color: #f8fafc;
  font-weight: 700;
  text-decoration: none;
  transition: color var(--transition-fast);
}

:deep(.footer-link:hover) {
  color: #34d399;
}

@media (max-width: 768px) {
  .auth-shell__topbar {
    padding: 22px 18px 0;
  }

  .auth-shell__main {
    padding: 56px 18px 28px;
  }

  .auth-shell__brand-caption {
    display: none;
  }

  .auth-shell__title {
    font-size: clamp(2.4rem, 12vw, 3.2rem);
  }

  .auth-shell__subtitle {
    margin-bottom: 24px;
    font-size: 0.92rem;
  }

  :deep(.field-box input) {
    height: 56px;
  }
}
</style>
