'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useDictionary } from '@/contexts/DictionaryContext';
import { AlertCircle, CheckCircle, Paintbrush } from 'lucide-react';

export default function VerifyEmailForm() {
    const { user, isLoading, verifyEmail, resendVerificationCode } = useAuth();
    const router = useRouter();
    const { dict, lang } = useDictionary();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push(`/${lang}/login`);
            } else if (user.isEmailVerified) {
                router.push(`/${lang}/account`);
            }
        }
    }, [isLoading, user, router, lang]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && resendDisabled) {
            setResendDisabled(false);
        }
    }, [countdown, resendDisabled]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        if (newCode.every(digit => digit !== '') && !newCode.includes('')) {
            handleSubmit();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace' && code[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').trim();
        if (/^\d+$/.test(pastedData)) {
            const digits = pastedData.slice(0, 6).split('');
            const newCode = [...code];
            digits.forEach((digit, index) => {
                if (index < 6) {
                    newCode[index] = digit;
                }
            });
            setCode(newCode);
            const nextEmptyIndex = newCode.findIndex(digit => digit === '');
            if (nextEmptyIndex !== -1) {
                inputRefs.current[nextEmptyIndex]?.focus();
            } else {
                inputRefs.current[5]?.focus();
            }
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const verificationCode = code.join('');
        if (verificationCode.length !== 6) return;
        setError(null);
        setSuccess(null);
        setIsVerifying(true);
        try {
            await verifyEmail(verificationCode);
            setSuccess(
                dict.auth?.emailVerifiedSuccess ||
                    'Email verified successfully! You will be redirected shortly.',
            );
            setTimeout(() => {
                router.push(`/${lang}/account`);
            }, 2000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    dict.auth?.verificationFailed ||
                        'Verification failed. Please try again.',
                );
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendCode = async () => {
        if (resendDisabled) return;
        setError(null);
        setSuccess(null);
        setIsResending(true);
        try {
            await resendVerificationCode(user?.email || '');
            setSuccess(
                dict.auth?.codeSentSuccess ||
                    'Verification code has been sent to your email.',
            );
            setResendDisabled(true);
            setCountdown(60);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    dict.auth?.resendCodeFailed ||
                        'Failed to resend verification code. Please try again.',
                );
            }
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 -right-24 w-72 h-72 bg-pink-200 dark:bg-pink-900 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-3xl"></div>
            </div>

            <main className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all duration-300 z-10">
                <div className="text-center">
                    <div className="flex justify-center">
                        <span className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <Paintbrush className="h-10 w-10 text-white" />
                        </span>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                        {dict.auth?.verifyEmailTitle || 'Verify Your Email'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {dict.auth?.verifyEmailDescription ||
                            'Please enter the verification code sent to your email address'}
                    </p>
                    {user?.email && (
                        <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {user.email}
                        </p>
                    )}
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-200 rounded-md flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {success}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4">
                            {dict.auth?.verificationCodeLabel ||
                                'Enter 6-digit code'}
                        </label>
                        <div className="flex justify-center space-x-2">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`verification-code-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e =>
                                        handleCodeChange(index, e.target.value)
                                    }
                                    onKeyDown={e => handleKeyDown(index, e)}
                                    onPaste={
                                        index === 0 ? handlePaste : undefined
                                    }
                                    ref={el => {
                                        inputRefs.current[index] = el;
                                    }}
                                    className="w-12 h-12 text-center text-2xl border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-bg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50"
                                />
                            ))}
                        </div>
                        <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                            {dict.auth?.codeInstructions ||
                                'Code expires in 15 minutes'}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            isVerifying || code.some(digit => digit === '')
                        }
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg mt-4">
                        {isVerifying ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                {dict.auth?.verifying || 'Verifying...'}
                            </>
                        ) : (
                            dict.auth?.verifyButton || 'Verify Email'
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={isResending || countdown > 0}
                            className="cursor-pointer text-sm text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400 transition-colors duration-200">
                            {isResending
                                ? dict.auth?.verifyEmail.resending ||
                                  'Resending...'
                                : countdown > 0
                                  ? (
                                        dict.auth?.verifyEmail.waitResend ||
                                        'Resend code in {seconds}s'
                                    ).replace('{seconds}', countdown.toString())
                                  : dict.auth?.verifyEmail.resendCode ||
                                    'Resend code'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            href={`/${lang}/login`}
                            className="inline-flex items-center justify-center w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200">
                            {dict.auth?.verifyEmail.backToLogin ||
                                'Back to login'}
                        </Link>
                    </div>
                </form>
            </main>
        </div>
    );
}
