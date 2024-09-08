// app/sign-up/page.js
'use client';
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase'; // Import auth from firebase.js

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setMessage('Account created successfully. Please sign in.');
            // Redirect after 2 seconds
            setTimeout(() => router.push('/sign-in'), 2000);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white rounded-lg shadow-lg p-8 mx-4 md:mx-auto max-w-sm w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign Up</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
                        required
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white p-3 rounded-md hover:bg-purple-700"
                    >
                        Sign Up
                    </button>
                    {message && <p className="text-green-500 mt-4">{message}</p>}
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </form>
                <p className="text-center mt-4">
                    Already have an account?{' '}
                    <a href="/sign-in" className="text-blue-500 hover:underline">
                        Sign In
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
