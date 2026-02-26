import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | ME Asset Flow',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-orange-400 via-red-500 to-red-600 bg-clip-text text-transparent">
            ME Asset Flow
          </span>
        </h1>
      </div>
    </main>
  );
}
