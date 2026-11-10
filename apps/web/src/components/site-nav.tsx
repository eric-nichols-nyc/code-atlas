"use client";

import { BrandIcon } from "@workspace/ui/components/brand-icon";
import {
  GlobalNav,
  type GlobalNavItem,
  type GlobalNavLinkProps,
} from "@workspace/ui/components/global-nav";
import {
  BookOpenIcon,
  CodeXmlIcon,
  LayoutDashboardIcon,
} from "@workspace/ui/components/icons";
import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavAuth } from "@/components/nav-auth";

const items: readonly GlobalNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
  },
];
const javascriptItems: readonly GlobalNavItem[] = [
  {
    id: "learn",
    label: "Learn",
    href: "/javascript/learn",
    icon: BookOpenIcon,
    appearance: "text",
  },
  {
    id: "practice",
    label: "Practice",
    href: "/javascript/practice",
    icon: CodeXmlIcon,
    appearance: "text",
  },
];

function NavLink(props: GlobalNavLinkProps) {
  return <Link {...props} prefetch={false} />;
}

export function SiteNav({ authConfigured }: { authConfigured: boolean }) {
  const pathname = usePathname();
  // Problem workspaces provide their own compact navigation back to the catalog.
  if (/^\/javascript\/practice\/[^/]+\/?$/.test(pathname)) return null;
  const inJavaScript =
    pathname === "/javascript" || pathname.startsWith("/javascript/");
  const navigationItems = inJavaScript ? javascriptItems : [];
  const activeItem = [...items, ...navigationItems].find((item) =>
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <GlobalNav
      brand={
        <Link href="/" className="inline-flex max-w-full items-center gap-2">
          <BrandIcon className="size-5 shrink-0" />
          <span className="truncate">Code Atlas</span>
        </Link>
      }
      items={navigationItems}
      leadingItems={items}
      itemsAlign={inJavaScript ? "center" : "start"}
      activeItemId={activeItem?.id}
      containerClassName="max-w-none"
      linkComponent={NavLink}
      actions={<NavAuth configured={authConfigured} />}
      utilities={<ThemeSwitcher />}
    />
  );
}
