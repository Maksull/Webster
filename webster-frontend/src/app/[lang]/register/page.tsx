import { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
    title: 'Register',
    description: 'Create a new account to join our platform',
};

export default function RegisterPage() {
    return <RegisterForm />;
}
