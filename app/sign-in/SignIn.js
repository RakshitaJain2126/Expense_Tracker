"use client";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const auth = getAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (error) {
            handleFirebaseError(error.code);
        }
    };

    const handleFirebaseError = (errorCode) => {
        switch (errorCode) {
            case "auth/user-not-found":
                setError("No account found with this email. Please sign up first.");
                break;
            case "auth/wrong-password":
                setError("Incorrect password. Please try again.");
                break;
            case "auth/invalid-email":
                setError("Invalid email address. Please enter a valid email.");
                break;
            case "auth/user-disabled":
                setError("This account has been disabled. Please contact support.");
                break;
            default:
                setError("An error occurred while signing in. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white rounded-lg shadow-lg p-8 mx-4 md:mx-auto max-w-sm w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign In</h2>
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
                    <button
                        type="submit"
                        className="w-full bg-dark-purple text-white p-3 rounded-md hover:bg-purple-700"
                    >
                        Sign In
                    </button>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </form>
                <p className="text-center mt-4">
                    Don't have an account?{" "}
                    <a href="/sign-up" className="text-blue-500 hover:underline">
                        Sign Up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
