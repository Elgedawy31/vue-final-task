export function formatDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  )
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
}

export function coverTheme(title = '') {
  return ['olive', 'rose', 'sand', 'ink', 'rust', 'sage'][
    Array.from(title).reduce((sum, character) => sum + character.charCodeAt(0), 0) % 6
  ]
}
