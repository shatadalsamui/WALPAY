import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col">
      {/* Top Bar (SSR, no client code) */}
      <header className="flex items-center justify-between px-8 py-6 shadow bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <div className="text-4xl text-[#333333] font-bold">WALPAY</div>
        </div>
        <div className="flex gap-4">
          <Link href="http://localhost:3001/signup" className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Sign Up</Link>
          <Link href="http://localhost:3001/signin" className="px-5 py-2 rounded-lg border border-blue-600 text-blue-700 font-semibold hover:bg-blue-50 transition">Sign In</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Hero Text & CTA */}
          <div className="relative z-10 flex flex-col items-start text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 animate-fade-in-up animate-delay-100">Pay friends. Pay for everything.</h1>
            <p className="text-lg md:text-xl text-blue-700 font-semibold mb-2 animate-fade-in-up animate-delay-200">Easily send money to your friends and pay for everything* you want online, in-store, and in apps with your WalPay account.</p>
            <p className="text-base md:text-lg text-gray-700 mb-8 animate-fade-in-up animate-delay-300">WalPay makes settling up with friends feel more... friendly. Send and receive money to split everyday necessities, bills, and shared activities like takeout or travel.</p>
            <div className="flex flex-col sm:flex-row gap-2 animate-fade-in-up animate-delay-400 mb-6">
              <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium shadow-sm animate-bounce animate-delay-500">WalPay everything, online and in-store.</span>
              <span className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium shadow-sm animate-bounce animate-delay-700">WalPay your friends</span>
            </div>
            <Link
              href="http://localhost:3001/signup"
              className="px-8 py-3 rounded-lg bg-gray-800 text-white font-bold text-lg shadow-lg hover:bg-gray-900 transition animate-fade-in-up animate-delay-800"
            >
              Get Started
            </Link>
          </div>
          {/* Right: Illustration/Animated Blob */}
          <div className="relative flex justify-center items-center">
            <div className="absolute -inset-8 z-0 animate-pulse">
              <svg width="340" height="180" viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="170" cy="90" rx="150" ry="70" fill="#3b82f6" fillOpacity="0.15"/>
              </svg>
            </div>
            {/* You can replace this with a more complex SVG or Lottie animation for production */}
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
              <circle cx="90" cy="90" r="80" fill="#2563eb" fillOpacity="0.12"/>
              <circle cx="90" cy="90" r="60" fill="#2563eb" fillOpacity="0.18"/>
              <circle cx="90" cy="90" r="40" fill="#2563eb" fillOpacity="0.25"/>
              <circle cx="90" cy="90" r="20" fill="#2563eb" fillOpacity="0.35"/>
            </svg>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-400 py-6 text-sm">
        &copy; {new Date().getFullYear()} WalPay. All rights reserved.
      </footer>
    </div>
  );
}
