# Books & Authors

A single page application for browsing books and authors, with an admin area for managing them.

Built with Vue 3, Vue Router, Pinia, and Bootstrap. The data comes from a json-server mock API.

## Running the project

Install the packages first:

```
npm install
```

Then open two terminals.

Terminal 1 — the mock API:

```
npm run server
```

Terminal 2 — the app:

```
npm run dev
```

The app runs on http://localhost:5173 and the API on http://localhost:3000.

## Admin login

- Username: `admin`
- Password: `admin`

## Pages

| Route | Page |
| --- | --- |
| `/` | Home with recent books |
| `/books` | All books, with search and author filter |
| `/books/:id` | Book details |
| `/authors` | All authors, with search |
| `/authors/:id` | Author details and their books |
| `/about` | About page with an FAQ accordion |
| `/login` | Admin login |
| `/admin` | Dashboard with book and author counts |
| `/admin/books` | Books table with create, edit, and delete |
| `/admin/authors` | Authors table with create, edit, and delete |

## Folder structure

```
src/
├── components/     reusable pieces (Navbar, Footer, cards, Toast, DataState)
├── views/          one component per page
├── stores/         Pinia stores (book, author, auth, toast)
├── router/         routes and the admin guard
├── App.vue
└── main.js
```
