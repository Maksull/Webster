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
    auth: {
        loginTitle: string;
        loginSubtitle: string;
        registerLink: string;
        loginFailed: string;
        usernameLabel: string;
        usernamePlaceholder: string;
        passwordLabel: string;
        forgotPassword: string;
        loggingIn: string;
        loginButton: string;
        registerTitle: string;
        registerSubtitle: string;
        loginLink: string;
        registrationFailed: string;
        firstNameLabel: string;
        firstNamePlaceholder: string;
        lastNameLabel: string;
        lastNamePlaceholder: string;
        emailLabel: string;
        emailPlaceholder: string;
        invalidEmail: string;
        passwordStrength: string;
        passwordWeak: string;
        passwordFair: string;
        passwordGood: string;
        passwordStrong: string;
        passwordMinLength: string;
        passwordUppercase: string;
        passwordLowercase: string;
        passwordNumber: string;
        specialSymbol: string;
        passwordsDoNotMatch: string;
        confirmPasswordLabel: string;
        passwordRequirements: string;
        registering: string;
        registerButton: string;
        termsText: string;
        termsLink: string;
        andText: string;
        privacyLink: string;
        resetPassword: {
            title: string;
            subtitle: string;
            loginLink: string;
            enterEmail: string;
            loading: string;
            submit: string;
            newPasswordTitle: string;
            newPasswordField: string;
            enterNewPassword: string;
            newPasswordSuccess: string;
            email: string;
        };
        errors: {
            generic: string;
        };
        verifyEmailTitle: string;
        verifyEmailDescription: string;
        emailVerifiedSuccess: string;
        verificationFailed: string;
        codeSentSuccess: string;
        resendCodeFailed: string;
        verificationCodeLabel: string;
        codeInstructions: string;
        verifying: string;
        verifyButton: string;
        noCodeReceived: string;
        resending: string;
        resendIn: string;
        resendCode: string;
        backToAccount: string;
    };
};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import('@/dictionaries/en.json').then(module => module.default),
    uk: () => import('@/dictionaries/uk.json').then(module => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    return dictionaries[locale]();
};
