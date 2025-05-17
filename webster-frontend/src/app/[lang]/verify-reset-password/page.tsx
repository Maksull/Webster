import { Metadata } from 'next';
import VerifyResetPasswordForm from './VerifyResetPasswordForm';

export const metadata: Metadata = {
    title: 'Verify Reset Code',
    description: 'Enter and verify the reset password code sent to your email',
};

export default function VerifyResetPasswordPage() {
    return <VerifyResetPasswordForm />;
}
