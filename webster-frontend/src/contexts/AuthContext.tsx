'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDictionary } from './DictionaryContext';
import { API_URL } from '@/config';

export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    role: 'user' | 'admin';
    bio?: string;
    phone?: string;
    isEmailVerified: boolean;
    newEmail?: string | null;
    emailChangeCode?: string | null;
    emailChangeCodeExpiresAt?: Date | null;
    showNameInEventVisitors: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (userData: RegisterUserData) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    verifyEmail: (code: string) => Promise<void>;
    changePassword: (
        currentPassword: string,
        newPassword: string,
    ) => Promise<void>;
    changeEmail: (password: string, newEmail: string) => Promise<void>;
    resendVerificationCode: (email: string) => Promise<void>;
    confirmEmailChange: (code: string) => Promise<void>;
    updateUser: (userData: Partial<User>) => Promise<void>;
    updateUserAvatar: (avatar: File) => Promise<void>;
    deleteUserAvatar: () => Promise<void>;
}

interface RegisterUserData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define protected route patterns (supports simple paths and regex patterns)
const PROTECTED_ROUTES = [
    '/account',
    '/events/create',
    '/events/[id]/edit',
    '/company/create',
    '/company/[id]/edit',
    '/company/[id]/manage',
    '/tickets/[id]',
    '/events/edit',
    '/company/edit',
    // Add any other protected routes here
];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();
    const { lang } = useDictionary();

    // Check if the current route is protected
    const isProtectedRoute = (path: string): boolean => {
        // Remove the language prefix for matching
        const pathWithoutLang = path.replace(/^\/[^\/]+/, '');

        return PROTECTED_ROUTES.some(route => {
            // For simple string routes
            if (!route.includes('[') && !route.includes(']')) {
                return (
                    pathWithoutLang === route ||
                    pathWithoutLang.startsWith(`${route}/`)
                );
            }

            // For routes with parameters (convert [id] to regex pattern)
            const regexPattern = route.replace(/\[\w+\]/g, '[^/]+');
            const regex = new RegExp(`^${regexPattern}(/.*)?$`);
            return regex.test(pathWithoutLang);
        });
    };

    // Helper function for API calls with authentication
    const authFetch = async (
        endpoint: string,
        options: RequestInit = {},
    ): Promise<Response> => {
        const token =
            typeof window !== 'undefined'
                ? localStorage.getItem('token')
                : null;

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        };

        return fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });
    };

    // Check if user is already authenticated on component mount
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);

            const token = localStorage.getItem('token');

            if (!token) {
                setIsLoading(false);
                setIsAuthenticated(false);
                return;
            }

            try {
                const response = await authFetch('/auth/verify');

                if (response.ok) {
                    // If verification is successful, fetch user data
                    const userResponse = await authFetch('/users/profile');

                    if (userResponse.ok) {
                        const userData = await userResponse.json();

                        if (userData.status === 'success' && userData.data) {
                            setUser(userData.data);
                            setIsAuthenticated(true);
                        } else {
                            localStorage.removeItem('token');
                            setIsAuthenticated(false);
                        }
                    } else {
                        // Invalid token or user data, clear localStorage
                        localStorage.removeItem('token');
                        setIsAuthenticated(false);
                    }
                } else {
                    // Invalid token, clear localStorage
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Handle route protection
    useEffect(() => {
        // Skip during initial load or SSR
        if (isLoading || typeof window === 'undefined' || !pathname) {
            return;
        }

        // Check if the current route needs protection
        if (isProtectedRoute(pathname) && !isAuthenticated) {
            const returnUrl = encodeURIComponent(
                window.location.pathname + window.location.search,
            );
            router.push(`/${lang}/login?returnUrl=${returnUrl}`);
        }
    }, [isLoading, isAuthenticated, pathname, router, lang]);

    const login = async (username: string, password: string): Promise<void> => {
        setIsLoading(true);

        try {
            const response = await authFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                const { token, user: userData } = result.data;

                // Store token in localStorage
                localStorage.setItem('token', token);

                setUser(userData);
                setIsAuthenticated(true);

                // Handle redirect after login
                const searchParams = new URLSearchParams(
                    window.location.search,
                );
                const returnUrl = searchParams.get('returnUrl');

                if (returnUrl && returnUrl.startsWith(`/${lang}/`)) {
                    router.push(returnUrl);
                } else {
                    router.push(`/${lang}/account`);
                }
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterUserData): Promise<void> => {
        setIsLoading(true);

        try {
            const response = await authFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                const { token, user: registeredUser } = result.data;

                localStorage.setItem('token', token);

                setUser(registeredUser);
                setIsAuthenticated(true);

                // Navigate to verify email page
                router.push(`/${lang}/verify-email`);
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);

        try {
            await authFetch('/auth/logout', {
                method: 'POST',
            });

            // Handle logout state cleanup
            localStorage.removeItem('token');

            setUser(null);
            setIsAuthenticated(false);
            router.push(`/${lang}/login`);
        } catch (error) {
            console.error('Logout error:', error);

            // Even if there's an error, clear local state
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
            router.push(`/${lang}/login`);
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string): Promise<void> => {
        try {
            const response = await authFetch('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Password reset request failed',
                );
            }

            return result;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    };

    const verifyEmail = async (code: string): Promise<void> => {
        try {
            const response = await authFetch('/auth/verify-email', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                // Update user is_email_verified status
                if (user) {
                    setUser({
                        ...user,
                        isEmailVerified: true,
                    });
                }
                return result;
            } else {
                throw new Error(result.message || 'Email verification failed');
            }
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    };

    const changePassword = async (
        currentPassword: string,
        newPassword: string,
    ): Promise<void> => {
        try {
            const response = await authFetch('/auth/change-password', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Password change failed');
            }

            return result;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    };

    const changeEmail = async (
        password: string,
        newEmail: string,
    ): Promise<void> => {
        try {
            const response = await authFetch('/auth/change-email', {
                method: 'POST',
                body: JSON.stringify({ password, newEmail }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Email change request failed',
                );
            }

            return result;
        } catch (error) {
            console.error('Change email error:', error);
            throw error;
        }
    };

    const resendVerificationCode = async (email: string): Promise<void> => {
        try {
            const response = await authFetch('/auth/resend-verification-code', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Failed to resend verification code',
                );
            }

            return result;
        } catch (error) {
            console.error('Resend verification code error:', error);
            throw error;
        }
    };

    const confirmEmailChange = async (code: string): Promise<void> => {
        try {
            const response = await authFetch('/auth/confirm-email-change', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                // If email change is successful and user is logged in, update the email
                if (user && user.newEmail) {
                    setUser({
                        ...user,
                        email: user.newEmail,
                        newEmail: null,
                    });
                }
                return result;
            } else {
                throw new Error(
                    result.message || 'Email change confirmation failed',
                );
            }
        } catch (error) {
            console.error('Confirm email change error:', error);
            throw error;
        }
    };

    const updateUser = async (userData: Partial<User>): Promise<void> => {
        try {
            const response = await authFetch('/users/profile', {
                method: 'PUT',
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                // Update the user data in the context
                if (user) {
                    setUser({
                        ...user,
                        ...result.data,
                    });
                }
            } else {
                throw new Error(result.message || 'Failed to update user data');
            }
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    };

    const updateUserAvatar = async (avatar: File): Promise<void> => {
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('avatar', avatar);
        try {
            const response = await fetch(
                `${API_URL}/users/${user?.id}/avatar`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                },
            );
            const result = await response.json();
            if (response.ok) {
                setUser(prev => {
                    if (!prev) {
                        return prev;
                    }

                    return {
                        ...prev,
                        avatar: result.data.avatar,
                    };
                });
            }
        } catch (error) {
            console.error('Update user avatar error:', error);
            throw error;
        }
    };

    const deleteUserAvatar = async (): Promise<void> => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(
                `${API_URL}/users/${user?.id}/avatar`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            if (response.ok) {
                setUser(prev => {
                    if (!prev) {
                        return prev;
                    }

                    return {
                        ...prev,
                        avatar: null,
                    };
                });
            }
        } catch (e) {
            console.error('Failed to remove photo:', e);
        }
    };

    // Render a loading indicator if checking authentication for a protected route
    if (isLoading && isProtectedRoute(pathname)) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                register,
                logout,
                resetPassword,
                verifyEmail,
                changePassword,
                changeEmail,
                resendVerificationCode,
                confirmEmailChange,
                updateUser,
                updateUserAvatar,
                deleteUserAvatar,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    // Add a helper function to check if user needs to verify email
    const needsEmailVerification =
        context.user && !context.user.isEmailVerified;

    return {
        ...context,
        needsEmailVerification,
    };
}

export default AuthContext;
