// Settings for the app.
//
// The reading assistant uses Google Gemini.
// Get a key from https://aistudio.google.com/apikey
//
// The key is not written here: it lives in the .env file, which git ignores.
// Copy .env.example to .env and put your key there.

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const GEMINI_MODEL = "gemini-3.6-flash";

// The json-server mock API
export const API_URL = "http://localhost:3000";
