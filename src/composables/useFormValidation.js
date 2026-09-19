import { computed, reactive, ref } from 'vue'

export function useFormValidation(validate) {
  const touched = reactive({})
  const submitted = ref(false)
  const errors = computed(validate)
  const valid = computed(() => Object.keys(errors.value).length === 0)
  function touch(field) {
    touched[field] = true
  }
  function fieldError(field) {
    return touched[field] || submitted.value ? errors.value[field] || '' : ''
  }
  function reveal() {
    submitted.value = true
  }
  return { errors, valid, touch, fieldError, reveal }
}
