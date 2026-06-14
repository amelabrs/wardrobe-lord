import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-6">
        <Link href="/" className="font-bold text-indigo-600 text-lg tracking-tight">
          👗 Wardrobe
        </Link>
        <div className="flex gap-1 ml-2">
          <NavLink href="/">Wardrobe</NavLink>
          <NavLink href="/locations">Locations</NavLink>
          <NavLink href="/search">Search</NavLink>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
    >
      {children}
    </Link>
  );
}
