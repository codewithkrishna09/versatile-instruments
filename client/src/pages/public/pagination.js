// Keep navigation compact even when the catalogue grows to hundreds of pages.
export function paginationItems(current, total) {
  const count = Math.max(0, Math.floor(total));
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const visible = new Set([1, count, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => visible.add(page));
  if (current >= count - 2)
    [count - 3, count - 2, count - 1].forEach((page) => visible.add(page));
  const pages = [...visible]
    .filter((page) => page >= 1 && page <= count)
    .sort((a, b) => a - b);
  const result = [];
  pages.forEach((page, index) => {
    const previous = pages[index - 1];
    if (previous && page - previous === 2) result.push(previous + 1);
    else if (previous && page - previous > 2) result.push(`gap-${previous}`);
    result.push(page);
  });
  return result;
}
