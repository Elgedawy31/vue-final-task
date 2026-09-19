<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthorsStore } from '../../stores/authors'
import { useToastsStore } from '../../stores/toasts'
import { useFormValidation } from '../../composables/useFormValidation'
import { validateAuthor } from '../../validation'
import PageHeading from '../../components/PageHeading.vue'
import DataState from '../../components/DataState.vue'
import FormField from '../../components/FormField.vue'
import AuthorAvatar from '../../components/AuthorAvatar.vue'
import AppIcon from '../../components/AppIcon.vue'
const route = useRoute()
const router = useRouter()
const authors = useAuthorsStore()
const toasts = useToastsStore()
const editing = computed(() => !!route.params.id)
const loading = ref(true)
const error = ref('')
const missing = ref(false)
const saving = ref(false)
const serverError = ref('')
const values = reactive({ name: '', bio: '', avatarUrl: '' })
const { valid, touch, fieldError, reveal } = useFormValidation(() => validateAuthor(values))
const preview = computed(() => ({ ...values, name: values.name || 'Your storyteller' }))
const canSubmit = computed(() => valid.value && !saving.value && !loading.value)
async function load() {
  loading.value = true
  error.value = ''
  missing.value = false
  try {
    if (editing.value) {
      const author = await authors.fetchById(route.params.id)
      Object.assign(values, { name: author.name, bio: author.bio, avatarUrl: author.avatarUrl })
    }
  } catch (failure) {
    if (failure.status === 404) missing.value = true
    else error.value = failure.message
  } finally {
    loading.value = false
  }
}
async function save() {
  reveal()
  if (!canSubmit.value) return
  saving.value = true
  serverError.value = ''
  try {
    const payload = {
      name: values.name.trim(),
      bio: values.bio.trim(),
      avatarUrl: values.avatarUrl.trim(),
    }
    if (editing.value) await authors.update(route.params.id, payload)
    else await authors.create(payload)
    toasts.show(editing.value ? 'Author profile updated.' : 'A new voice joins the library.')
    router.push('/admin/authors')
  } catch (failure) {
    serverError.value = failure.message
    toasts.show(failure.message, 'error')
  } finally {
    saving.value = false
  }
}
onMounted(load)
</script>

<template>
  <RouterLink to="/admin/authors" class="back-link"
    ><AppIcon name="back" :size="17" /> Back to authors</RouterLink
  ><PageHeading
    eyebrow="THE STORYTELLERS"
    :title="editing ? 'Refine their story.' : 'Welcome a new voice.'"
    :description="
      editing ? 'Keep this author’s profile up to date.' : 'Introduce the person behind the pages.'
    "
  /><DataState
    :loading="loading"
    :error="error"
    :empty="missing"
    title="Author not found"
    description="This author may have been removed from the library."
    @retry="load"
    ><div class="form-layout">
      <form class="admin-panel editor-form" novalidate @submit.prevent="save">
        <div class="form-section-heading">
          <AppIcon name="users" :size="21" />
          <h2>Author details</h2>
          <span>* Required fields</span>
        </div>
        <FormField id="name" label="Full name" required :error="fieldError('name')" v-slot="field"
          ><input
            id="name"
            v-model="values.name"
            class="form-control"
            :class="{ 'is-invalid': field.invalid }"
            :aria-invalid="field.invalid"
            :aria-describedby="field.describedby"
            placeholder="e.g. Andy Weir"
            required
            @blur="touch('name')" /></FormField
        ><FormField
          id="avatarUrl"
          label="Portrait URL"
          hint="Use a public http or https image URL. Leave blank to use initials."
          :error="fieldError('avatarUrl')"
          v-slot="field"
          ><input
            id="avatarUrl"
            v-model="values.avatarUrl"
            type="url"
            class="form-control"
            :class="{ 'is-invalid': field.invalid }"
            :aria-invalid="field.invalid"
            :aria-describedby="field.describedby"
            placeholder="https://example.com/portrait.jpg"
            @blur="touch('avatarUrl')" /></FormField
        ><FormField
          id="bio"
          label="Biography"
          :hint="`${values.bio.length} / 800 characters`"
          :error="fieldError('bio')"
          v-slot="field"
        >
          <textarea
            id="bio"
            v-model="values.bio"
            rows="8"
            class="form-control"
            :class="{ 'is-invalid': field.invalid }"
            :aria-invalid="field.invalid"
            :aria-describedby="field.describedby"
            placeholder="Tell us a little about their life, work, and the worlds they create…"
            @blur="touch('bio')"
          ></textarea>
        </FormField>
        <p v-if="serverError" class="field-error" role="alert">{{ serverError }}</p>
        <div class="form-actions">
          <RouterLink to="/admin/authors" class="btn btn-outline-secondary">Cancel</RouterLink
          ><button class="btn btn-primary" :disabled="!canSubmit">
            <span v-if="saving" class="spinner-border spinner-border-sm"></span
            ><AppIcon v-else name="check" :size="18" />{{
              saving ? 'Saving…' : editing ? 'Save changes' : 'Add author'
            }}
          </button>
        </div>
      </form>
      <aside class="form-preview author-preview">
        <p class="eyebrow">MEET YOUR STORYTELLER</p>
        <AuthorAvatar :author="preview" />
        <h3>{{ preview.name }}</h3>
        <p class="preview-bio">{{ values.bio || 'Their story starts here.' }}</p>
        <p class="preview-note">
          <AppIcon name="leaf" :size="17" /> Behind every great book is a voice worth knowing.
        </p>
      </aside>
    </div></DataState
  >
</template>
