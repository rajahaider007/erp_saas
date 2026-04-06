import React from 'react';
import { Head } from '@inertiajs/react';

// This is a simple React component to get you started.
// Inertia will automatically find and render this when you
// visit the root URL.
export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <h1 className="text-4xl font-bold text-gray-800">
                    Hello from React!
                </h1>
            </div>
        </>
    );
}
