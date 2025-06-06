import { Metadata } from 'next';
import { SetNewPasswordForm } from './SetNewPasswordForm';

export const metadata: Metadata = {
    title: 'Set New Password',
    description: 'Set a new password for your account.',
};

export default function NewPasswordPage() {
    return <SetNewPasswordForm />;
}
