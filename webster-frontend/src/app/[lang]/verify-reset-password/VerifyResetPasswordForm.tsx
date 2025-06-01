'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Paintbrush } from 'lucide-react';
import Link from 'next/link';
import { useDictionary } from '@/contexts';

export default function VerifyResetPasswordPage() {
    const { dict, lang } = useDictionary();
    const router = useRouter();

    const [token, setToken] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [email, setEmail] = useState('');

    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    useEffect(() => {
        // Get the email from localStorage
        const storedEmail = localStorage.getItem('resetPasswordEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(
                () => setResendTimer(prev => prev - 1),
                1000,
            );
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleResendToken = async () => {
        if (!email) {
            setError(
                dict.auth.errors.emailRequired ||
                    'Email is required to resend the reset code',
            );
            return;
        }

        setIsResending(true);
        setError('');
        setResendSuccess(false);

        try {
            const response = await fetch(
                'http://localhost:3001/auth/resend-reset-password-token',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                },
            );

            const data = await response.json();

            if (data.status === 'error') {
                setError(data.message || dict.auth.errors.generic);
                return;
            }

            setResendSuccess(true);
            setResendTimer(60); // 60-second cooldown
        } catch {
            setError(dict.auth.errors.generic);
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setResendSuccess(false);

        const verificationToken = token.join('');

        try {
            const response = await fetch(
                'http://localhost:3001/auth/check-reset-token',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: verificationToken }),
                },
            );

            const data = await response.json();

            if (data.status === 'error') {
                setError(data.message || dict.auth.errors.generic);
                return;
            }

            setTimeout(
                () =>
                    router.push(
                        `/${lang}/set-new-password?token=${verificationToken}`,
                    ),
                1500,
            );
        } catch {
            setError(dict.auth.errors.generic);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTokenChange = (index: number, value: string) => {
        if (value.length > 1) {
            const newValue = value.slice(0, 1);
            const newToken = [...token];
            newToken[index] = newValue;
            setToken(newToken);
            if (index < 5) {
                inputRefs[index + 1].current?.focus();
            }
        } else {
            if (!/^\d*$/.test(value)) {
                return;
            }
            const newToken = [...token];
            newToken[index] = value;
            setToken(newToken);
            if (value && index < 5) {
                inputRefs[index + 1].current?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text/plain');
        const digits = pastedText.replace(/\D/g, '').slice(0, 6);
        const newToken = digits.split('').slice(0, 6);
        setToken(newToken);
        inputRefs[newToken.length - 1].current?.focus();
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace' && !token[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs[index - 1].current?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 -right-24 w-72 h-72 bg-pink-200 dark:bg-pink-900 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-3xl"></div>
            </div>
            <main className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all duration-300">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <div className="flex justify-center">
                            <span className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                                <Paintbrush className="h-10 w-10 text-white" />
                            </span>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                            {dict.auth.resetPassword.title ||
                                'Verify Reset Code'}
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            {dict.auth.verifyEmail.description ||
                                'Please enter the code sent to your email address'}
                        </p>
                    </div>
                </div>

                <div className="mt-8 mx-auto w-full max-w-md">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    {resendSuccess && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-200 rounded-md">
                            {dict.auth.resetPassword.success ||
                                'Reset code has been resent to your email.'}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4">
                                {dict.auth.verifyEmail.enterCode ||
                                    'Enter 6-digit code'}
                            </label>
                            <div className="flex justify-center space-x-2">
                                {token.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs[index]}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e =>
                                            handleTokenChange(
                                                index,
                                                e.target.value,
                                            )
                                        }
                                        onPaste={handlePaste}
                                        onKeyDown={e => handleKeyDown(index, e)}
                                        className="w-12 h-12 text-center text-2xl border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-bg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50"
                                    />
                                ))}
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                {dict.auth.verifyEmail.codeExpiry ||
                                    'Code expires in 15 minutes'}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || token.some(digit => !digit)}
                            className="cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg mt-4">
                            {isLoading
                                ? dict.auth.resetPassword.loading ||
                                  'Verifying...'
                                : dict.auth.resetPassword.submitVerify ||
                                  'Verify'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendToken}
                                disabled={isResending || resendTimer > 0}
                                className="cursor-pointer text-sm text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400 transition-colors duration-200">
                                {isResending
                                    ? dict.auth.verifyEmail.resending ||
                                      'Resending...'
                                    : resendTimer > 0
                                      ? (
                                            dict.auth.verifyEmail.waitResend ||
                                            'Resend code in {seconds}s'
                                        ).replace(
                                            '{seconds}',
                                            resendTimer.toString(),
                                        )
                                      : dict.auth.verifyEmail.resendCode ||
                                        'Resend code'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link
                                href={`/${lang}/login`}
                                className="inline-flex items-center justify-center w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200">
                                {dict.auth.verifyEmail.backToLogin ||
                                    'Back to login'}
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
