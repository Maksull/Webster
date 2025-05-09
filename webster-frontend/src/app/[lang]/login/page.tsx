import { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Log in to access your account and explore various features.',
};

export default function LoginPage() {
    return <LoginForm />;
}
