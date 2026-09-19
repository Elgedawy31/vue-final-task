<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import AppIcon from './AppIcon.vue'
const props = defineProps({
  entityType: { type: String, required: true },
  entityId: { type: [String, Number], required: true },
  name: { type: String, required: true },
})
const open = ref(false)
const input = ref('')
const messages = ref([])
const sending = ref(false)
const error = ref('')
const inputElement = ref(null)
const launcher = ref(null)
const panel = ref(null)
const scrollArea = ref(null)
let controller = null
let previousFocus = null
let leavingPage = false
const suggestions = computed(() => {
  if (props.entityType === 'book') {
    return [
      'Give me a spoiler-free introduction',
      'What themes does this book explore?',
      'Tell me about the author',
    ]
  }
  return [
    'Tell me about this author',
    'What is their writing style like?',
    'Which of their books are in this library?',
  ]
})
const canSend = computed(
  () => !!input.value.trim() && input.value.trim().length <= 1000 && !sending.value,
)
async function openChat() {
  previousFocus = document.activeElement
  open.value = true
  await nextTick()
  panel.value?.showModal()
  inputElement.value?.focus()
}
async function closeChat() {
  panel.value?.close()
  open.value = false
  await nextTick()
  if (previousFocus && previousFocus.isConnected) {
    previousFocus.focus()
  } else if (launcher.value) {
    launcher.value.focus()
  }
}
async function scrollBottom() {
  await nextTick()
  if (scrollArea.value) scrollArea.value.scrollTop = scrollArea.value.scrollHeight
}
async function send(question = input.value) {
  const text = question.trim()
  if (!text || text.length > 1000 || sending.value) return
  sending.value = true
  error.value = ''
  input.value = ''
  messages.value.push({ role: 'user', content: text })
  await scrollBottom()
  if (open.value) inputElement.value?.focus()
  controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 50000)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        entityType: props.entityType,
        entityId: String(props.entityId),
        messages: messages.value.slice(-11),
      }),
    })
    const result = await response.json()
    if (!response.ok)
      throw new Error(result.error || 'The reading assistant is unavailable. Please try again.')
    messages.value.push({ role: 'assistant', content: result.answer })
  } catch (failure) {
    if (leavingPage) return
    if (controller.signal.aborted) {
      error.value = 'The reply took too long. Please try again.'
    } else if (failure instanceof TypeError || failure.name === 'SyntaxError') {
      error.value = 'The reading assistant could not connect. Please try again.'
    } else {
      error.value = failure.message
    }
    messages.value.pop()
    input.value = text
  } finally {
    clearTimeout(timer)
    sending.value = false
    await scrollBottom()
  }
}
function submit() {
  if (canSend.value) send()
}
function clearChat() {
  if (!sending.value) {
    messages.value = []
    error.value = ''
    input.value = ''
    inputElement.value?.focus()
  }
}
onBeforeUnmount(() => {
  leavingPage = true
  if (controller) controller.abort()
})
defineExpose({ openChat })
</script>

<template>
  <div class="chat-widget position-fixed">
    <Transition name="chat"
      ><dialog
        v-if="open"
        ref="panel"
        class="chat-panel position-fixed text-body d-flex flex-column border rounded-3 overflow-hidden m-0 p-0 bg-body-tertiary"
        aria-modal="true"
        aria-labelledby="chat-title"
        @cancel.prevent="closeChat"
      >
        <header
          class="chat-header d-flex align-items-center gap-2 bg-primary p-3"
        >
          <span
            class="chat-brand d-flex align-items-center justify-content-center rounded-3 border flex-shrink-0"
            ><AppIcon name="sparkles" :size="23"
          /></span>
          <div>
            <h2 class="fw-normal m-0 fs-5" id="chat-title">
              Your reading companion
            </h2>
            <p class="mt-1 mb-0 mx-0 small">
              Let’s turn a little curiosity into a conversation.
            </p>
          </div>
          <button
            class="icon-button d-inline-flex align-items-center justify-content-center border-0 rounded-1 ms-auto flex-shrink-0 p-2"
            aria-label="Close reading assistant"
            @click="closeChat"
          >
            <AppIcon class="flex-shrink-0" name="close" :size="19" />
          </button>
        </header>
        <div
          class="chat-context border-bottom d-flex align-items-center gap-2 py-2 px-3 text-body-secondary"
        >
          <AppIcon
            :name="entityType === 'book' ? 'book' : 'users'"
            :size="16"
          /><span class="overflow-hidden text-nowrap small">{{ name }}</span
          ><button
            class="icon-button d-inline-flex align-items-center justify-content-center border-0 rounded-1 ms-auto p-2"
            aria-label="Start a new conversation"
            :disabled="sending"
            @click="clearChat"
          >
            <AppIcon class="flex-shrink-0" name="refresh" :size="15" />
          </button>
        </div>
        <div
          ref="scrollArea"
          class="chat-messages overflow-y-auto p-3"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          <div
            v-if="!messages.length"
            class="chat-welcome text-center px-0 py-3"
          >
            <span
              class="feature-icon rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
              ><AppIcon name="sparkles" :size="26"
            /></span>
            <h3 class="fw-normal fs-3">There’s more to this story.</h3>
            <p class="mt-2 text-body-secondary mx-0 small">
              Ask me about {{ name }}.<br />Where would you like to begin?
            </p>
            <div class="chat-suggestions d-flex flex-column gap-2 mt-4">
              <button
                class="border rounded-2 text-start d-flex align-items-center justify-content-between gap-2 p-2 small"
                v-for="question in suggestions"
                :key="question"
                :disabled="sending"
                @click="send(question)"
              >
                {{ question
                }}<AppIcon class="flex-shrink-0" name="arrow" :size="15" />
              </button>
            </div>
          </div>
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="chat-message mt-0 me-0 mb-3"
            :class="message.role"
          >
            <span
              class="message-label d-block mb-1 small text-body-secondary"
              >{{ message.role === 'user' ? 'You' : 'Folio companion' }}</span
            >
            <p class="m-0 py-2 px-3 small" dir="auto">{{ message.content }}</p>
          </div>
          <div
            v-if="sending"
            class="chat-thinking d-flex align-items-center gap-2 text-body-secondary small"
            role="status"
          >
            <span class="spinner-border spinner-border-sm"></span> Finding the
            words…
          </div>
          <div
            v-if="error"
            class="chat-error border rounded-2 d-flex align-items-start gap-2 p-2 bg-body-tertiary text-body-secondary"
            role="alert"
          >
            <AppIcon class="flex-shrink-0" name="alert" :size="18" />
            <p class="m-0 small">{{ error }}</p>
          </div>
        </div>
        <form
          class="chat-input-form position-relative pt-2 pb-0 border-top px-3"
          @submit.prevent="submit"
        >
          <label for="chat-question" class="visually-hidden"
            >Your question</label
          ><textarea
            class="w-100 text-body border rounded-2 pe-5 ps-2 py-2 bg-body-tertiary small"
            id="chat-question"
            ref="inputElement"
            v-model="input"
            rows="2"
            maxlength="1000"
            placeholder="What are you curious about?"
            :readonly="sending"
            @keydown.enter.exact.prevent="submit"
            dir="auto"
          ></textarea
          ><button
            class="chat-send position-absolute bg-primary border-0 rounded-1 d-flex align-items-center justify-content-center"
            :disabled="!canSend"
            aria-label="Send question"
          >
            <AppIcon class="flex-shrink-0" name="send" :size="18" />
          </button>
        </form>
        <p class="chat-disclaimer text-center m-2 small text-body-secondary">
          AI can make mistakes. Stay curious, and check the details.
        </p>
      </dialog></Transition
    ><button
      v-show="!open"
      ref="launcher"
      class="chat-launcher align-items-center gap-2 border rounded-pill p-3 px-md-4 small"
      aria-label="Open reading assistant"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="openChat"
    >
      <AppIcon class="flex-shrink-0" name="sparkles" :size="23" /><span
        >Ask Folio</span
      >
    </button>
  </div>
</template>
