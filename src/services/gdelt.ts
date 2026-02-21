import { API } from '../config';

export interface GdeltArticle {
  url: string;
  url_mobile?: string;
  title: string;
  seendate: string; // e.g. "20260220T063400Z"
  socialimage?: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

export interface GdeltResponse {
  articles: GdeltArticle[];
}

function parseGdeltDate(seendate: string): number {
  // Format: "20260220T063400Z" → unix ms
  const m = seendate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return 0;
  return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`).getTime();
}

export async function fetchGdeltEvents(
  query: string,
  timespan = '7d',
  maxrecords = 25
): Promise<GdeltArticle[]> {
  const params = new URLSearchParams({
    query,
    mode: 'artlist',
    timespan,
    maxrecords: maxrecords.toString(),
    sort: 'DateDesc',
    format: 'json',
  });
  const res = await fetch(`${API.gdelt}?${params}`);
  if (!res.ok) throw new Error(`GDELT ${res.status}`);
  const data: GdeltResponse = await res.json();
  const articles = data.articles ?? [];
  // Sort newest first
  return articles.sort((a, b) => parseGdeltDate(b.seendate) - parseGdeltDate(a.seendate));
}

export { parseGdeltDate };
