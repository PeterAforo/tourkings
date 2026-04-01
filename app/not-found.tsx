import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-headline font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-4">
          Page Not Found
        </h2>
        <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 hero-gradient text-on-primary font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
