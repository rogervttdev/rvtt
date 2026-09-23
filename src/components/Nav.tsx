"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "./SessionProvider";
import { TankardIcon } from "./Logo";
import { supabase } from "@/lib/supabase";

const LINKS = [
  { href: "/fichas", label: "Fichas" },
  { href: "/mesas", label: "Mesas" },
];

export function Nav() {
  const { user, displayName } = useSession();
  const pathname = usePathname();

  return (
    <header className="tavern-wood sticky top-0 z-30 h-14 border-b-2 border-brass-deep shadow-[0_2px_10px_rgb(0_0_0/0.35)]">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold text-brass-light">
          <TankardIcon />
          Taverna Inicial
        </Link>
        {user && (
          <nav className="flex gap-1">
            {LINKS.map((l) => {
              const active = pathname.startsWith(l.href) || (l.href === "/mesas" && pathname.startsWith("/mesa/"));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-md px-3 py-1.5 font-semibold ${
                    active
                      ? "bg-wood-light text-brass-light shadow-[inset_0_1px_3px_rgb(0_0_0/0.4)]"
                      : "text-foam/80 hover:text-brass-light"
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
              <span className="hidden text-foam/80 sm:inline">{displayName}</span>
              <button className="btn btn-brass px-3 py-1.5" onClick={() => supabase.auth.signOut()}>
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
