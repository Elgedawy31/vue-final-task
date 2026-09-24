import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const isLoggedIn = ref(localStorage.getItem("loggedIn") === "true");

  const login = (username, password) => {
    if (username === "admin" && password === "admin") {
      isLoggedIn.value = true;
      localStorage.setItem("loggedIn", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    isLoggedIn.value = false;
    localStorage.removeItem("loggedIn");
  };

  return { isLoggedIn, login, logout };
});
