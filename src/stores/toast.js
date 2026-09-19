import { defineStore } from "pinia";
import { ref } from "vue";

export const useToastStore = defineStore("toast", () => {
  // State
  const message = ref("");
  const type = ref("success");

  // Actions
  const showToast = (text, kind = "success") => {
    message.value = text;
    type.value = kind;

    setTimeout(() => {
      message.value = "";
    }, 3000);
  };

  return { message, type, showToast };
});
