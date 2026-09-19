export function isValidUrl(value) {
  if (!value?.trim()) return true
  try {
    return ['http:', 'https:'].includes(new URL(value.trim()).protocol)
  } catch {
    return false
  }
}

export function parseTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

export function validateAuthor(values) {
  const errors = {}
  const name = values.name.trim()
  if (name.length < 2 || name.length > 60) errors.name = 'Enter a name between 2 and 60 characters.'
  if (values.bio.length > 800) errors.bio = 'Keep the biography to 800 characters or fewer.'
  if (!isValidUrl(values.avatarUrl)) errors.avatarUrl = 'Enter a valid http or https URL.'
  return errors
}

export function validateBook(values, authors, books, currentId = null) {
  const errors = {}
  const title = values.title.trim()
  if (title.length < 3 || title.length > 100)
    errors.title = 'Enter a title between 3 and 100 characters.'
  if (!authors.some((author) => String(author.id) === String(values.authorId)))
    errors.authorId = 'Choose an existing author.'
  const year = Number(values.year)
  const currentYear = new Date().getFullYear()
  if (!Number.isInteger(year) || year < 1800 || year > currentYear)
    errors.year = `Enter a year from 1800 to ${currentYear}.`
  const tags = parseTags(values.tags)
  if (tags.length > 8 || tags.some((tag) => tag.length < 2 || tag.length > 20))
    errors.tags = 'Use up to 8 tags, each between 2 and 20 characters.'
  if (new Set(tags).size !== tags.length) errors.tags = 'Each tag should be unique.'
  if (!isValidUrl(values.coverUrl)) errors.coverUrl = 'Enter a valid http or https URL.'
  if (values.description.length > 2000)
    errors.description = 'Keep the description to 2,000 characters or fewer.'
  if (
    books.some(
      (book) =>
        String(book.id) !== String(currentId) &&
        String(book.authorId) === String(values.authorId) &&
        book.title.trim().toLowerCase() === title.toLowerCase(),
    )
  )
    errors.title = 'This author already has a book with this title.'
  return errors
}
