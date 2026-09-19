<script setup>
defineProps({ id: String, label: String, error: String, hint: String, required: Boolean })
</script>

<template>
  <div class="form-field">
    <label :for="id" class="form-label"
      >{{ label }} <span v-if="required" class="required-mark">*</span
      ><span v-else class="optional-label">optional</span></label
    ><slot
      :invalid="!!error"
      :describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
    />
    <p v-if="error" :id="`${id}-error`" class="field-error">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="field-hint">{{ hint }}</p>
  </div>
</template>
