import { en } from './en';
import { vi } from './vi';
import type { Dictionary } from './en';

export type { Dictionary } from './en';

export const dictionaries = { en, vi } satisfies Record<'en' | 'vi', Dictionary>;

export type Locale = keyof typeof dictionaries;

export function getLocale(url: URL): Locale {
  return url.pathname.startsWith('/vi') ? 'vi' : 'en';
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function localizedPath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return locale === 'en' ? clean : `/vi${clean === '/' ? '' : clean}`;
}
