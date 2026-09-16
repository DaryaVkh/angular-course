/**
 * Базовая ссылка на презентацию (Google Drive, PDF).
 * `#page=N` — deep-link на конкретную страницу PDF-просмотрщика Drive.
 */
export const SLIDES_BASE_URL =
  'https://drive.google.com/file/d/1Za4cFmLCpijsyiCBQZL5t8QgTMZIhaXu/view';

export function slidesUrl(page: number): string {
  return `${SLIDES_BASE_URL}#page=${page}`;
}
