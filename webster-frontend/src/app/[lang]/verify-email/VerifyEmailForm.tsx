'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useDictionary } from '@/contexts/DictionaryContext';
import {
    Shield,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    ArrowLeft,
} from 'lucide-react';

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
            <main className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all duration-300">
                <div className="form-heading text-center">
                    <div className="flex justify-center">
                        <span className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Shield className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                        </span>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">
                        {dict.auth?.verifyEmailTitle || 'Verify Your Email'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
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
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border-l-4 border-red-500 animate-fadeIn">
                        <div className="flex">
                            <span className="flex-shrink-0">
                                <AlertCircle
                                    className="h-5 w-5 text-red-400"
                                    aria-hidden="true"
                                />
                            </span>
                            <p className="ml-3 text-sm font-medium text-red-800 dark:text-red-200">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border-l-4 border-green-500 animate-fadeIn">
                        <div className="flex">
                            <span className="flex-shrink-0">
                                <CheckCircle
                                    className="h-5 w-5 text-green-400"
                                    aria-hidden="true"
                                />
                            </span>
                            <p className="ml-3 text-sm font-medium text-green-800 dark:text-green-200">
                                {success}
                            </p>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                            {dict.auth?.verificationCodeLabel ||
                                'Verification Code'}
                        </legend>

                        <div className="flex justify-center gap-2">
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
                                    className="w-12 h-14 text-center font-bold text-xl border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                    style={{ appearance: 'textfield' }}
                                    aria-label={`Digit ${index + 1} of verification code`}
                                />
                            ))}
                        </div>

                        <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
                            {dict.auth?.codeInstructions ||
                                'Enter the 6-digit code sent to your email'}
                        </p>
                    </fieldset>

                    <button
                        type="submit"
                        disabled={
                            isVerifying || code.some(digit => digit === '')
                        }
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm hover:shadow">
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
                                        strokeWidth="4"></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {dict.auth?.verifying || 'Verifying...'}
                            </>
                        ) : (
                            dict.auth?.verifyButton || 'Verify Email'
                        )}
                    </button>
                </form>

                <section className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {dict.auth?.noCodeReceived || "Didn't receive a code?"}
                    </p>
                    <button
                        onClick={handleResendCode}
                        disabled={isResending || resendDisabled}
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200">
                        {isResending ? (
                            <>
                                <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                {dict.auth?.resending || 'Resending...'}
                            </>
                        ) : resendDisabled ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {dict.auth?.resendIn || 'Resend in'} {countdown}
                                s
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {dict.auth?.resendCode ||
                                    'Resend verification code'}
                            </>
                        )}
                    </button>
                </section>

                <nav className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Link
                        href={`/${lang}/account`}
                        className="inline-flex items-center justify-center w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {dict.auth?.backToAccount || 'Back to account'}
                    </Link>
                </nav>
            </main>
        </div>
    );
}
