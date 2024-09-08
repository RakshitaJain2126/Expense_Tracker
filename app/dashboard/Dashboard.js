// app/dashboard/Dashboard.js
'use client'; // Add this at the top to mark it as a client component

import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Dashboard = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
        console.log('User signed out');
    };

    return (
        <div>
            {user ? (
                <div>
                    <h2>Welcome, {user.email}</h2>
                    <button onClick={handleSignOut}>Sign Out</button>
                </div>
            ) : (
                <h2>You are not logged in</h2>
            )}
        </div>
    );
};

export default Dashboard;
