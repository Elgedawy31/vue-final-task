import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useToastsStore = defineStore('toasts', () => {
  const messages = ref([])
  function dismiss(id) {
    messages.value = messages.value.filter((message) => message.id !== id)
  }
  function show(text, type = 'success') {
    const id = crypto.randomUUID()
    messages.value.push({ id, text, type })
    setTimeout(() => dismiss(id), 5000)
  }
  return { messages, show, dismiss }
})
