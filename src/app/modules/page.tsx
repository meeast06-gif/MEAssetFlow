'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Loading from '@/app/loading';
import Link from 'next/link';

const modules = [
    "Machinery Maintenance T02_13",
    "Plant Maintenance T02_11",
    "CAD/CAM DesignLab T01_23",
    "Electrical Fundamental"
];

export default function ModulesPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <Loading />;
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
             <div className="text-center mb-12">
                <h1 className="text-6xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-orange-300 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-lg brightness-110 saturate-125">
                        ME Asset Flow
                    </span>
                </h1>
                <p className="mt-4 text-2xl text-muted-foreground">Select a Module</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {modules.map((moduleName) => (
                    <Link 
                        href="/dashboard" 
                        key={moduleName} 
                        className="block p-1 bg-gradient-to-r from-orange-300 via-red-500 to-red-600 rounded-xl transform hover:scale-105 transition-transform duration-300"
                    >
                       <div className="h-full w-full bg-card rounded-lg p-6 flex items-center justify-center text-center min-h-[120px]">
                            <h2 className="text-lg font-semibold text-card-foreground">{moduleName}</h2>
                       </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
