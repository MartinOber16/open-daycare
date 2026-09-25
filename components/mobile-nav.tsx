"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@/lib/mock/feed";
import { SidebarContent } from "@/components/sidebar";
import { BrandIcon, CloseIcon, MenuIcon } from "@/components/icons";

export function MobileNav({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-[16px] py-[12px] lg:hidden">
        <Link href="/" className="flex items-center gap-[11px]">
          <div className="flex size-[38px] flex-none items-center justify-center rounded-[12px] bg-[linear-gradient(155deg,#F8C3A8,#F2937A)] text-white">
            <BrandIcon className="size-[21px]" />
          </div>
          <span className="font-fredoka text-[17px] font-semibold text-brown">
            OpenDayCare
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-drawer"
          aria-label="Abrir menú"
          className="flex size-[38px] items-center justify-center rounded-[12px] bg-cream text-text-nav"
        >
          <MenuIcon className="size-[20px]" />
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <div
        id="mobile-drawer"
        inert={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card px-[16px] py-[24px] transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar menú"
          className="absolute top-[24px] right-[16px] flex size-[32px] items-center justify-center rounded-[10px] bg-cream text-text-faint"
        >
          <CloseIcon className="size-[16px]" />
        </button>
        <SidebarContent session={session} onNavigate={close} />
      </div>
    </>
  );
}
