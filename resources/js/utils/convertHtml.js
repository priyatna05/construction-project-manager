/**
 * @param {string | null | undefined} html
 * @returns {string}
 */
export function stripHtml(html) {
  if (!html) {
    return '';
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}
