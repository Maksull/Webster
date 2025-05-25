import { Metadata } from 'next';
import VerifyEmailChangeForm from './VerifyEmailChangeForm';

export const metadata: Metadata = {
    title: 'Verify Email Change',
    description: 'Verify your new email address',
};

export default function VerifyEmailPage() {
    return <VerifyEmailChangeForm />;
}
