import { Metadata } from 'next';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Reset your password to regain access to your account.',
};

export default function ResetPasswordPage() {
    return <ResetPasswordForm />;
}
