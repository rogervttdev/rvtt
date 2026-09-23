"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "./SessionProvider";
import { supabase } from "@/lib/supabase";

const LINKS = [
  { href: "/fichas", label: "Fichas" },
  { href: "/mesas", label: "Mesas" },
];

export function Nav() {
  const { user, displayName } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-module-soft bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-module-deep">
          <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
            <path d="M16 3 28 10v12l-12 7-12-7V10z" fill="#1d5fa8" />
            <path d="M16 3v26M4 10l24 12M28 10 4 22" stroke="#fff" strokeWidth="1.4" opacity=".75" />
          </svg>
          Tábula
        </Link>
        {user && (
          <nav className="flex gap-1">
            {LINKS.map((l) => {
              const active = pathname.startsWith(l.href) || (l.href === "/mesas" && pathname.startsWith("/mesa/"));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                    active ? "bg-module-soft text-module-deep" : "text-dim hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-3 text-sm">
          {user && (
            <>
              <span className="hidden text-dim sm:inline">{displayName}</span>
              <button className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
