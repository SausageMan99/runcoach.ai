import { Suspense } from 'react'
import SignupForm from './signup-form'
import { Loader2 } from 'lucide-react'

function SignupLoading() {
    return (
        <div className="w-full max-w-md flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={<SignupLoading />}>
            <SignupForm />
        </Suspense>
    )
}
