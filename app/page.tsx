import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          JustPlay
        </h1>
        <p className="text-center text-2xl sm:text-3xl mb-6 font-semibold">
          Saturday Morning Cartoons, Reimagined
        </p>
        <p className="text-center text-lg sm:text-xl mb-12 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Bring back the magic of scheduled viewing with intentional entertainment and fair creator pay.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors text-center"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📺</div>
            <h3 className="text-xl font-semibold mb-2">Scheduled Lineups</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create your own Saturday morning schedule. Watch on your time, not the algorithm&apos;s.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Fair Creator Pay</h3>
            <p className="text-gray-600 dark:text-gray-400">
              50% revenue share for creators. Supporting artists who bring stories to life.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-semibold mb-2">Parental Controls</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Set time limits, schedule viewing windows, and create kid profiles.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
