import Link from "next/link";

export default function AuthFormFooter() {
  return (
    <footer className="pt-12 text-center">
      <nav className="flex justify-center space-x-6 mb-4">
        <Link href="/about" className="text-xs text-outline hover:text-secondary transition-colors">
          Privacy Policy
        </Link>
        <Link href="/about" className="text-xs text-outline hover:text-secondary transition-colors">
          Terms of Service
        </Link>
        <Link href="/contact" className="text-xs text-outline hover:text-secondary transition-colors">
          Help Center
        </Link>
      </nav>
      <p className="text-[10px] text-outline font-medium tracking-wide">
        © {new Date().getFullYear()} TourKings. Ghanaian Heritage, Global Luxury.
      </p>
    </footer>
  );
}
