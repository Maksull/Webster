import { Locale } from './i18n-config';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Dictionary = {};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import('@/dictionaries/en.json').then(module => module.default),
    uk: () => import('@/dictionaries/uk.json').then(module => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    return dictionaries[locale]();
};
