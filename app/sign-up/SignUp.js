"use client";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setMessage("Account created successfully. Please sign in.");
            setError("");
            setTimeout(() => router.push("/sign-in"), 2000);
        } catch (error) {
            handleFirebaseError(error.code);
        }
    };

    const handleFirebaseError = (errorCode) => {
        switch (errorCode) {
            case "auth/email-already-in-use":
                setError("This email is already in use. Please use a different email.");
                break;
            case "auth/invalid-email":
                setError(
                    "The email address is invalid. Please check your email and try again."
                );
                break;
            case "auth/weak-password":
                setError("The password is too weak. Please use a stronger password.");
                break;
            default:
                setError(
                    "An error occurred while creating the account. Please try again."
                );
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
                        className="w-full bg-dark-purple text-white p-3 rounded-md hover:bg-purple-700"
                    >
                        Sign Up
                    </button>
                    {message && <p className="text-green-500 mt-4">{message}</p>}
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </form>
                <p className="text-center mt-4">
                    Already have an account?{" "}
                    <a href="/sign-in" className="text-blue-500 hover:underline">
                        Sign In
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
