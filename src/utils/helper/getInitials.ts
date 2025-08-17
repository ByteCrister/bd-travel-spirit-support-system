export function getInitials(name: string) {
  return name
    // Split on spaces (“John Doe” → [“John”, “Doe”])
    .split(' ')
    // Map each word to its first letter ([“J”, “D”])
    .map((word) => word[0])
    // Join them into one string (“JD”)
    .join('')
    // Limit to two characters (“J”, “D” → “JD”; “Mary Ann Smith” → “MA”)
    .slice(0, 2)
    // Uppercase just in case (“jd” → “JD”)
    .toUpperCase()
}
