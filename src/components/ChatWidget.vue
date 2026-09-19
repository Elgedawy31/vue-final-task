<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
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
const suggestions = computed(() =>
  props.entityType === 'book'
    ? [
        'Give me a spoiler-free introduction',
        'What themes does this book explore?',
        'Tell me about the author',
      ]
    : [
        'Tell me about this author',
        'What is their writing style like?',
        'Which of their books are in this library?',
      ],
)
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
  ;(previousFocus?.isConnected ? previousFocus : launcher.value)?.focus()
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
  const timer = setTimeout(() => controller?.abort('timeout'), 50000)
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
    if (controller?.signal.reason === 'unmounted') return
    error.value =
      failure.name === 'SyntaxError' || failure instanceof TypeError
        ? 'The reading assistant could not connect. Please try again.'
        : controller?.signal.aborted
          ? 'The reply took too long. Please try again.'
          : failure.message
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
watch(
  () => props.entityId,
  () => {
    controller?.abort('unmounted')
    clearChat()
    open.value = false
  },
)
onBeforeUnmount(() => controller?.abort('unmounted'))
defineExpose({ openChat })
</script>

<template>
  <div class="chat-widget">
    <Transition name="chat"
      ><dialog
        v-if="open"
        ref="panel"
        class="chat-panel"
        aria-modal="true"
        aria-labelledby="chat-title"
        @cancel.prevent="closeChat"
      >
        <header class="chat-header">
          <span class="chat-brand"><AppIcon name="sparkles" :size="23" /></span>
          <div>
            <h2 id="chat-title">Your reading companion</h2>
            <p>Let’s turn a little curiosity into a conversation.</p>
          </div>
          <button class="icon-button" aria-label="Close reading assistant" @click="closeChat">
            <AppIcon name="close" :size="19" />
          </button>
        </header>
        <div class="chat-context">
          <AppIcon :name="entityType === 'book' ? 'book' : 'users'" :size="16" /><span>{{
            name
          }}</span
          ><button
            class="icon-button"
            aria-label="Start a new conversation"
            :disabled="sending"
            @click="clearChat"
          >
            <AppIcon name="refresh" :size="15" />
          </button>
        </div>
        <div
          ref="scrollArea"
          class="chat-messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          <div v-if="!messages.length" class="chat-welcome">
            <span class="feature-icon"><AppIcon name="sparkles" :size="26" /></span>
            <h3>There’s more to this story.</h3>
            <p>Ask me about {{ name }}.<br />Where would you like to begin?</p>
            <div class="chat-suggestions">
              <button
                v-for="question in suggestions"
                :key="question"
                :disabled="sending"
                @click="send(question)"
              >
                {{ question }}<AppIcon name="arrow" :size="15" />
              </button>
            </div>
          </div>
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="chat-message"
            :class="message.role"
          >
            <span class="message-label">{{
              message.role === 'user' ? 'You' : 'Folio companion'
            }}</span>
            <p dir="auto">{{ message.content }}</p>
          </div>
          <div v-if="sending" class="chat-thinking" role="status">
            <span class="spinner-border spinner-border-sm"></span> Finding the words…
          </div>
          <div v-if="error" class="chat-error" role="alert">
            <AppIcon name="alert" :size="18" />
            <p>{{ error }}</p>
          </div>
        </div>
        <form class="chat-input-form" @submit.prevent="submit">
          <label for="chat-question" class="visually-hidden">Your question</label
          ><textarea
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
          ><button class="chat-send" :disabled="!canSend" aria-label="Send question">
            <AppIcon name="send" :size="18" />
          </button>
        </form>
        <p class="chat-disclaimer">AI can make mistakes. Stay curious, and check the details.</p>
      </dialog></Transition
    ><button
      v-show="!open"
      ref="launcher"
      class="chat-launcher"
      aria-label="Open reading assistant"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="openChat"
    >
      <AppIcon name="sparkles" :size="23" /><span>Ask Folio</span>
    </button>
  </div>
</template>
