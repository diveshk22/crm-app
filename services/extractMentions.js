export function extractMentions(text) {
  const regex = /@(\w+)/g;
  let match;
  const mentions = [];

  while ((match = regex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}
