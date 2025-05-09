'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useDictionary } from '@/contexts/DictionaryContext';
import {
    UserPlus,
    AlertCircle,
    Eye,
    EyeOff,
    Check,
    X,
    Paintbrush,
} from 'lucide-react';

export const RegisterForm = () => {
    const { register } = useAuth();
    const { dict, lang } = useDictionary();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
        {},
    );

    useEffect(() => {
        if (!formData.password) {
            setPasswordStrength(0);
            return;
        }
        let strength = 0;
        if (formData.password.length >= 8) strength += 1;
        if (/[A-Z]/.test(formData.password)) strength += 1;
        if (/[a-z]/.test(formData.password)) strength += 1;
        if (/[0-9]/.test(formData.password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
        setPasswordStrength(strength);
        if (touchedFields.password) {
            updatePasswordValidationErrors();
        }
    }, [formData.password]);

    useEffect(() => {
        if (
            touchedFields.confirmPassword &&
            formData.password !== formData.confirmPassword
        ) {
            setValidationErrors(prev => {
                if (
                    !prev.includes(
                        dict.auth?.passwordsDoNotMatch ||
                            'Passwords do not match',
                    )
                ) {
                    return [
                        ...prev,
                        dict.auth?.passwordsDoNotMatch ||
                            'Passwords do not match',
                    ];
                }
                return prev;
            });
        } else if (touchedFields.confirmPassword) {
            setValidationErrors(prev =>
                prev.filter(
                    err =>
                        err !==
                        (dict.auth?.passwordsDoNotMatch ||
                            'Passwords do not match'),
                ),
            );
        }
    }, [
        formData.confirmPassword,
        formData.password,
        touchedFields.confirmPassword,
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));
        if (name === 'password') {
            updatePasswordValidationErrors();
        }
    };

    const updatePasswordValidationErrors = () => {
        const requirements = getMissingPasswordRequirements();
        setValidationErrors(requirements);
    };

    const getPasswordStrengthLabel = () => {
        if (passwordStrength <= 1) return dict.auth?.passwordWeak || 'Weak';
        if (passwordStrength <= 2) return dict.auth?.passwordFair || 'Fair';
        if (passwordStrength <= 4) return dict.auth?.passwordGood || 'Good';
        return dict.auth?.passwordStrong || 'Strong';
    };

    const getMissingPasswordRequirements = () => {
        const requirements = [];
        if (formData.password.length < 8) {
            requirements.push(
                dict.auth?.passwordMinLength ||
                    'Password must be at least 8 characters',
            );
        }
        if (!/[A-Z]/.test(formData.password)) {
            requirements.push(
                dict.auth?.passwordUppercase ||
                    'Password must contain at least one uppercase letter',
            );
        }
        if (!/[a-z]/.test(formData.password)) {
            requirements.push(
                dict.auth?.passwordLowercase ||
                    'Password must contain at least one lowercase letter',
            );
        }
        if (!/[0-9]/.test(formData.password)) {
            requirements.push(
                dict.auth?.passwordNumber ||
                    'Password must contain at least one number',
            );
        }
        if (!/[^A-Za-z0-9]/.test(formData.password)) {
            requirements.push(
                dict.auth?.specialSymbol ||
                    'Password must contain at least one special symbol',
            );
        }
        return requirements;
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength <= 2) return 'bg-orange-500';
        if (passwordStrength <= 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const isPasswordStrongEnough = () => {
        return (
            formData.password.length >= 8 &&
            /[A-Z]/.test(formData.password) &&
            /[a-z]/.test(formData.password) &&
            /[0-9]/.test(formData.password) &&
            /[^A-Za-z0-9]/.test(formData.password)
        );
    };

    const validateForm = () => {
        const passwordErrors = getMissingPasswordRequirements();
        if (formData.password !== formData.confirmPassword) {
            passwordErrors.push(
                dict.auth?.passwordsDoNotMatch || 'Passwords do not match',
            );
        }
        if (passwordErrors.length > 0) {
            setValidationErrors(passwordErrors);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    dict.auth?.registrationFailed ||
                        'Registration failed. Please try again.',
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isPasswordMatching =
        formData.password === formData.confirmPassword &&
        formData.confirmPassword !== '';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 -right-24 w-72 h-72 bg-pink-200 dark:bg-pink-900 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-3xl"></div>
            </div>

            <main className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transition-all duration-300 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 z-10 border border-gray-100 dark:border-gray-700">
                <div className="form-heading text-center">
                    <div className="flex justify-center">
                        <span className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <Paintbrush className="h-10 w-10 text-white" />
                        </span>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                        {dict.auth?.registerTitle || 'Create your account'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        {dict.auth?.registerSubtitle ||
                            'Already have an account?'}{' '}
                        <Link
                            href={`/${lang}/login`}
                            className="font-medium text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400 transition-colors duration-200">
                            {dict.auth?.loginLink || 'Sign in here'}
                        </Link>
                    </p>
                </div>

                {/* Server error messages */}
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

                {/* Client-side validation errors */}
                {validationErrors.length > 0 && touchedFields.password && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 border-l-4 border-amber-500 animate-fadeIn">
                        <div className="flex">
                            <span className="flex-shrink-0">
                                <AlertCircle
                                    className="h-5 w-5 text-amber-400"
                                    aria-hidden="true"
                                />
                            </span>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                                    {dict.auth?.passwordRequirements ||
                                        'Please fix the following issues:'}
                                </p>
                                <ul className="list-disc pl-5 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                                    {validationErrors.map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <fieldset className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* First Name */}
                            <label className="block" htmlFor="firstName">
                                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {dict.auth?.firstNameLabel || 'First Name'}
                                </span>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm shadow-sm"
                                    placeholder={
                                        dict.auth?.firstNamePlaceholder ||
                                        'John'
                                    }
                                />
                            </label>

                            {/* Last Name */}
                            <label className="block" htmlFor="lastName">
                                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {dict.auth?.lastNameLabel || 'Last Name'}
                                </span>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm shadow-sm"
                                    placeholder={
                                        dict.auth?.lastNamePlaceholder || 'Doe'
                                    }
                                />
                            </label>
                        </div>

                        {/* Username */}
                        <label className="block" htmlFor="username">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.auth?.usernameLabel || 'Username'}
                            </span>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm shadow-sm"
                                placeholder={
                                    dict.auth?.usernamePlaceholder || 'johndoe'
                                }
                            />
                        </label>

                        {/* Email */}
                        <label className="block" htmlFor="email">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.auth?.emailLabel || 'Email'}
                            </span>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`appearance-none relative block w-full px-3 py-2.5 border ${
                                        touchedFields.email && !isEmailValid
                                            ? 'border-red-300 dark:border-red-700'
                                            : touchedFields.email &&
                                                isEmailValid
                                              ? 'border-green-300 dark:border-green-700'
                                              : 'border-gray-300 dark:border-gray-600'
                                    } rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm shadow-sm`}
                                    placeholder={
                                        dict.auth?.emailPlaceholder ||
                                        'john.doe@example.com'
                                    }
                                />
                                {touchedFields.email && (
                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        {isEmailValid ? (
                                            <Check className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <X className="h-5 w-5 text-red-500" />
                                        )}
                                    </span>
                                )}
                            </div>
                            {touchedFields.email && !isEmailValid && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {dict.auth?.invalidEmail ||
                                        'Please enter a valid email address'}
                                </p>
                            )}
                        </label>

                        {/* Password */}
                        <label className="block" htmlFor="password">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.auth?.passwordLabel || 'Password'}
                            </span>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`appearance-none relative block w-full px-3 py-2.5 border ${
                                        touchedFields.password &&
                                        validationErrors.length > 0
                                            ? 'border-red-300 dark:border-red-700'
                                            : isPasswordStrongEnough()
                                              ? 'border-green-300 dark:border-green-700'
                                              : 'border-gray-300 dark:border-gray-600'
                                    } rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm pr-10 shadow-sm`}
                                    placeholder="********"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    aria-label={
                                        showPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }>
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                    )}
                                </button>
                            </div>

                            {/* Password strength indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {dict.auth?.passwordStrength ||
                                                'Password Strength'}
                                            :
                                        </span>
                                        <span
                                            className={`text-xs font-medium ${
                                                passwordStrength <= 1
                                                    ? 'text-red-500'
                                                    : passwordStrength <= 2
                                                      ? 'text-orange-500'
                                                      : passwordStrength <= 4
                                                        ? 'text-yellow-500'
                                                        : 'text-green-500'
                                            }`}>
                                            {getPasswordStrengthLabel()}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                                            style={{
                                                width: `${(passwordStrength / 5) * 100}%`,
                                            }}
                                            role="progressbar"
                                            aria-valuenow={passwordStrength}
                                            aria-valuemin={0}
                                            aria-valuemax={5}
                                            aria-label="Password strength indicator"
                                        />
                                    </div>

                                    <ul className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        <li
                                            className={`flex items-center ${
                                                formData.password.length >= 8
                                                    ? 'text-green-500'
                                                    : ''
                                            }`}>
                                            <span className="mr-1">
                                                {formData.password.length >= 8
                                                    ? '✓'
                                                    : '○'}
                                            </span>
                                            {dict.auth?.passwordMinLength ||
                                                'At least 8 characters'}
                                        </li>
                                        <li
                                            className={`flex items-center ${
                                                /[A-Z]/.test(formData.password)
                                                    ? 'text-green-500'
                                                    : ''
                                            }`}>
                                            <span className="mr-1">
                                                {/[A-Z]/.test(formData.password)
                                                    ? '✓'
                                                    : '○'}
                                            </span>
                                            {dict.auth?.passwordUppercase ||
                                                'At least one uppercase letter'}
                                        </li>
                                        <li
                                            className={`flex items-center ${
                                                /[a-z]/.test(formData.password)
                                                    ? 'text-green-500'
                                                    : ''
                                            }`}>
                                            <span className="mr-1">
                                                {/[a-z]/.test(formData.password)
                                                    ? '✓'
                                                    : '○'}
                                            </span>
                                            {dict.auth?.passwordLowercase ||
                                                'At least one lowercase letter'}
                                        </li>
                                        <li
                                            className={`flex items-center ${
                                                /[0-9]/.test(formData.password)
                                                    ? 'text-green-500'
                                                    : ''
                                            }`}>
                                            <span className="mr-1">
                                                {/[0-9]/.test(formData.password)
                                                    ? '✓'
                                                    : '○'}
                                            </span>
                                            {dict.auth?.passwordNumber ||
                                                'At least one number'}
                                        </li>
                                        <li
                                            className={`flex items-center ${
                                                /[^A-Za-z0-9]/.test(
                                                    formData.password,
                                                )
                                                    ? 'text-green-500'
                                                    : ''
                                            }`}>
                                            <span className="mr-1">
                                                {/[^A-Za-z0-9]/.test(
                                                    formData.password,
                                                )
                                                    ? '✓'
                                                    : '○'}
                                            </span>
                                            {dict.auth?.specialSymbol ||
                                                'At least one special symbol'}
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </label>

                        {/* Confirm Password */}
                        <label className="block" htmlFor="confirmPassword">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.auth?.confirmPasswordLabel ||
                                    'Confirm Password'}
                            </span>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`appearance-none relative block w-full px-3 py-2.5 border ${
                                        touchedFields.confirmPassword &&
                                        !isPasswordMatching
                                            ? 'border-red-300 dark:border-red-700'
                                            : isPasswordMatching &&
                                                formData.confirmPassword
                                              ? 'border-green-300 dark:border-green-700'
                                              : 'border-gray-300 dark:border-gray-600'
                                    } rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm pr-10 shadow-sm`}
                                    placeholder="********"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }>
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                    )}
                                </button>

                                {touchedFields.confirmPassword &&
                                    formData.confirmPassword && (
                                        <span className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                                            {isPasswordMatching ? (
                                                <Check className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <X className="h-5 w-5 text-red-500" />
                                            )}
                                        </span>
                                    )}
                            </div>

                            {touchedFields.confirmPassword &&
                                !isPasswordMatching &&
                                formData.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {dict.auth?.passwordsDoNotMatch ||
                                            'Passwords do not match'}
                                    </p>
                                )}
                        </label>
                    </fieldset>

                    <button
                        type="submit"
                        disabled={isLoading || validationErrors.length > 0}
                        className="cursor-pointer group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-75 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg">
                        {isLoading ? (
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
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
                            </span>
                        ) : (
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <UserPlus
                                    className="h-5 w-5 text-purple-200 group-hover:text-white transition-colors duration-200"
                                    aria-hidden="true"
                                />
                            </span>
                        )}
                        {isLoading
                            ? dict.auth?.registering || 'Registering...'
                            : dict.auth?.registerButton || 'Create account'}
                    </button>

                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                        {dict.auth?.termsText ||
                            'By creating an account, you agree to our'}{' '}
                        <Link
                            href={`/${lang}/terms`}
                            className="text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400">
                            {dict.auth?.termsLink || 'Terms of Service'}
                        </Link>{' '}
                        {dict.auth?.andText || 'and'}{' '}
                        <Link
                            href={`/${lang}/privacy`}
                            className="text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400">
                            {dict.auth?.privacyLink || 'Privacy Policy'}
                        </Link>
                    </div>
                </form>
            </main>
        </div>
    );
};
