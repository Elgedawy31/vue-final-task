<template>
  <Transition name="fade">
    <div v-if="isOpen" class="confirm-backdrop" @click.self="close(false)">
      <div
        class="confirm-box"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div class="confirm-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5M14 11v5" />
          </svg>
        </div>

        <h2 id="confirm-title" class="confirm-title">{{ title }}</h2>
        <p id="confirm-message" class="confirm-message">{{ message }}</p>

        <div class="confirm-actions">
          <button class="btn btn-outline-secondary" @click="close(false)">Cancel</button>
          <button ref="confirmButton" class="btn btn-danger" @click="close(true)">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useConfirmStore } from "../stores/confirm.js";

const confirmStore = useConfirmStore();
const { isOpen, title, message, confirmText } = storeToRefs(confirmStore);
const { close } = confirmStore;

const confirmButton = ref(null);

watch(isOpen, async (open) => {
  if (!open) return;
  await nextTick();
  confirmButton.value?.focus();
});

const handleKey = (event) => {
  if (isOpen.value && event.key === "Escape") close(false);
};

onMounted(() => window.addEventListener("keydown", handleKey));
onBeforeUnmount(() => window.removeEventListener("keydown", handleKey));
</script>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1060;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #33262a66;
  backdrop-filter: blur(2px);
}

.confirm-box {
  width: 100%;
  max-width: 400px;
  padding: 28px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: 0 20px 50px #38262a33;
  text-align: center;
}

.confirm-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f8e4e6;
  color: #b02a37;
}

.confirm-title {
  font-size: 24px;
  margin-bottom: 8px;
}

.confirm-message {
  color: var(--muted);
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.confirm-actions .btn {
  min-width: 110px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
