<script setup>
import { ref, watch, nextTick } from 'vue'
import AppIcon from './AppIcon.vue'
const props = defineProps({ open: Boolean, title: String, message: String, busy: Boolean })
const emit = defineEmits(['cancel', 'confirm'])
const dialog = ref(null)
watch(
  () => props.open,
  async (value) => {
    await nextTick()
    if (value && !dialog.value.open) dialog.value.showModal()
    else if (!value && dialog.value.open) dialog.value.close()
  },
)
function cancel(event) {
  event?.preventDefault()
  if (!props.busy) emit('cancel')
}
</script>

<template>
  <dialog
    ref="dialog"
    class="confirm-dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
    @cancel="cancel"
  >
    <span class="delete-symbol"><AppIcon name="trash" :size="25" /></span>
    <h2 id="dialog-title">{{ title }}</h2>
    <p id="dialog-description">{{ message }}</p>
    <div class="d-flex justify-content-end gap-2">
      <button autofocus class="btn btn-outline-secondary" :disabled="busy" @click="cancel">
        Keep it</button
      ><button class="btn btn-danger" :disabled="busy" @click="$emit('confirm')">
        <span v-if="busy" class="spinner-border spinner-border-sm"></span
        >{{ busy ? 'Deleting…' : 'Yes, delete' }}
      </button>
    </div>
  </dialog>
</template>
