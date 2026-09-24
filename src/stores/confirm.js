import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfirmStore = defineStore("confirm", () => {
  const isOpen = ref(false);
  const title = ref("");
  const message = ref("");
  const confirmText = ref("Delete");

  let resolver = null;

  const askConfirm = (options) => {
    title.value = options.title || "Are you sure?";
    message.value = options.message || "";
    confirmText.value = options.confirmText || "Delete";
    isOpen.value = true;

    return new Promise((resolve) => {
      resolver = resolve;
    });
  };

  const close = (answer) => {
    isOpen.value = false;
    if (resolver) resolver(answer);
    resolver = null;
  };

  return { isOpen, title, message, confirmText, askConfirm, close };
});
