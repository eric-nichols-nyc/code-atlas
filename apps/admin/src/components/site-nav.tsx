"use client";

import {
  GlobalNav,
  type GlobalNavItem,
  type GlobalNavLinkProps,
} from "@workspace/ui/components/global-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items: readonly GlobalNavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
];

function NavLink(props: GlobalNavLinkProps) {
  return <Link {...props} prefetch={false} />;
}

export function SiteNav() {
  const pathname = usePathname();
  const activeItem = items.find((item) =>
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <GlobalNav
      brand={<Link href="/">Code Atlas Admin</Link>}
      items={items}
      activeItemId={activeItem?.id}
      linkComponent={NavLink}
      navigationLabel="Administration navigation"
    />
  );
}
