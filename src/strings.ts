export function splitIntoMultilineString(
  input: string,
  maxLength: number = 100
): string {
  const lines: string[] = [];
  let start = 0;

  while (start < input.length) {
    // Find the next break point
    let end = start + maxLength;

    // Ensure we don't break in the middle of a word
    if (end < input.length && input[end] !== " ") {
      let lastSpace = input.lastIndexOf(" ", end);
      if (lastSpace > start) {
        end = lastSpace;
      }
    }

    lines.push(input.substring(start, end).trim());
    start = end + 1; // Move to the next segment
  }

  return lines.join("\n");
}

export function pascalToCamel(str: string) {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}
