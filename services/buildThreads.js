export function buildThreads(messages) {
  const threads = messages.filter((m) => !m.parent_id);

  const replies = (parentId) =>
    messages.filter((m) => m.parent_id === parentId);

  return { threads, replies };
}
