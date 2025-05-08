import { Locale } from './i18n-config';

export type Dictionary = {
    header: {
        brand: string;
        login: string;
        logout: string;
        account: string;
        register: string;
    };
    home: {
        heroTitleFirst: string;
        heroTitleSecond: string;
        heroDescription: string;
        heroUsers: string;
        editorPlaceholder: string;
        featuresTitle: string;
        featuresSubtitle: string;
        featuresDescription: string;
        ctaReady: string;
        ctaStart: string;
        getStarted: string;
        ctaLearn: string;
        testimonialsTitle: string;
        testimonialsSubtitle: string;
        editorTitle: string;
    };
    footer: {
        brand: string;
        description: string;
        copyright: string;
    };
};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import('@/dictionaries/en.json').then(module => module.default),
    uk: () => import('@/dictionaries/uk.json').then(module => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    return dictionaries[locale]();
};
