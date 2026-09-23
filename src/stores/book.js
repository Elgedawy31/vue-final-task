import { defineStore } from "pinia";
import { ref } from "vue";
import { API_URL } from "../config.js";

const API = `${API_URL}/books`;

export const useBookStore = defineStore("book", () => {
  // State
  const books = ref([]);
  const loading = ref(false);
  const error = ref(false);

  const selectedBook = ref(null);
  const selectedLoading = ref(false);
  const selectedError = ref(false);

  // Actions
  const getAllBooks = async () => {
    try {
      loading.value = true;
      error.value = false;
      const response = await fetch(API);
      books.value = await response.json();
    } catch (e) {
      error.value = true;
    } finally {
      loading.value = false;
    }
  };

  const getBookById = async (id) => {
    try {
      selectedLoading.value = true;
      selectedError.value = false;
      selectedBook.value = null;

      const response = await fetch(`${API}/${id}`);
      if (!response.ok) return;

      selectedBook.value = await response.json();
    } catch (e) {
      selectedError.value = true;
    } finally {
      selectedLoading.value = false;
    }
  };

  const createBook = async (book) => {
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    const created = await response.json();
    books.value.push(created);
  };

  const updateBook = async (id, book) => {
    const response = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    const updated = await response.json();
    const index = books.value.findIndex((b) => b.id === id);
    if (index !== -1) books.value[index] = updated;
  };

  const deleteBook = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    books.value = books.value.filter((b) => b.id !== id);
  };

  return {
    books,
    loading,
    error,
    selectedBook,
    selectedLoading,
    selectedError,
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
  };
});
