"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import type { Session } from "@/lib/mock/feed";
import {
  BellIcon,
  BrandIcon,
  ChildrenIcon,
  HomeIcon,
  LogoutIcon,
  PlusIcon,
  UserIcon,
} from "@/components/icons";

type NavItem = {
  label: string;
  href: string | null;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { label: "Feed", href: "/", icon: HomeIcon },
  { label: "Niños", href: null, icon: ChildrenIcon },
  { label: "Avisos", href: null, icon: BellIcon },
  { label: "Mi cuenta", href: null, icon: UserIcon },
];

const itemClassName =
  "flex items-center gap-[12px] rounded-[12px] px-[12px] py-[11px] text-[14.5px]";

export function SidebarContent({
  session,
  onNavigate,
}: {
  session: Session;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-[11px] px-[8px] pt-[4px] pb-[22px]"
      >
        <div className="flex size-[38px] flex-none items-center justify-center rounded-[12px] bg-[linear-gradient(155deg,#F8C3A8,#F2937A)] text-white">
          <BrandIcon className="size-[21px]" />
        </div>
        <div>
          <div className="font-fredoka text-[17px] leading-[1] font-semibold text-brown">
            OpenDayCare
          </div>
          <div className="mt-[2px] text-[11.5px] text-text-soft">
            {session.classroom}
          </div>
        </div>
      </Link>

      <span className="mb-[18px] flex w-full items-center justify-center gap-[8px] rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[12px] py-[12px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]">
        <PlusIcon className="size-[17px]" />
        Nueva publicación
      </span>

      <nav className="flex flex-1 flex-col gap-[4px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="size-[19px]" />
              {item.label}
            </>
          );

          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={`${itemClassName} bg-coral-soft font-extrabold text-terracotta`}
            >
              {content}
            </Link>
          ) : (
            <span
              key={item.label}
              className={`${itemClassName} font-semibold text-text-nav`}
            >
              {content}
            </span>
          );
        })}
      </nav>

      <div className="mt-[10px] border-t border-border pt-[14px]">
        <div className="flex items-center gap-[11px] px-[8px] py-[6px]">
          <div className="flex size-[38px] flex-none items-center justify-center rounded-full bg-orange font-fredoka text-[16px] font-semibold text-white">
            {session.initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-extrabold text-brown">
              {session.name}
            </div>
            <div className="text-[12px] text-text-soft">{session.role}</div>
          </div>
          <span
            title="Cerrar sesión"
            className="flex size-[32px] flex-none items-center justify-center rounded-[10px] bg-cream text-text-faint"
          >
            <LogoutIcon className="size-[16px]" />
          </span>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ session }: { session: Session }) {
  return (
    <aside className="sticky top-0 hidden h-[100vh] w-[248px] flex-none flex-col border-r border-border bg-card px-[16px] py-[24px] lg:flex">
      <SidebarContent session={session} />
    </aside>
  );
}
