"use client";

import { Badge } from "@workspace/ui/components/badge";
import { BrandIcon } from "@workspace/ui/components/brand-icon";
import { Button } from "@workspace/ui/components/button";
import {
  GlobalNav,
  type GlobalNavItem,
  type GlobalNavLinkProps,
} from "@workspace/ui/components/global-nav";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CodeXmlIcon,
  LayoutDashboardIcon,
  LoaderCircleIcon,
  WorkflowIcon,
} from "@workspace/ui/components/icons";
import {
  JavaScriptIcon,
  ReactIcon,
} from "@workspace/ui/components/technology-icons";
import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher";
import { cn } from "@workspace/ui/lib/utils";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { createPortal } from "react-dom";
import { NavAuth } from "@/components/nav-auth";
import { isReactPilotAvailable } from "@/features/react-sandbox/lib/availability";

function withNavigationStatus(Icon: typeof BookOpenIcon, label: string) {
  return function NavigationIcon(props: ComponentProps<typeof BookOpenIcon>) {
    const { pending } = useLinkStatus();
    const CurrentIcon = pending ? LoaderCircleIcon : Icon;
    return (
      <>
        <CurrentIcon
          {...props}
          className={cn(props.className, pending && "motion-safe:animate-spin")}
        />
        {pending && (
          <>
            <span role="status" className="sr-only hidden md:block">
              Loading {label}…
            </span>
            {createPortal(
              <Badge
                role="status"
                variant="secondary"
                className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 gap-2 px-3 py-2 md:hidden"
              >
                <LoaderCircleIcon
                  aria-hidden="true"
                  data-icon="inline-start"
                  className="motion-safe:animate-spin"
                />
                Loading {label}…
              </Badge>,
              document.body,
            )}
          </>
        )}
      </>
    );
  };
}

const DashboardIcon = withNavigationStatus(LayoutDashboardIcon, "Dashboard");
const BackIcon = withNavigationStatus(ArrowLeftIcon, "Dashboard");
const LearnIcon = withNavigationStatus(BookOpenIcon, "Learn");
const PracticeIcon = withNavigationStatus(CodeXmlIcon, "Practice");
const subjectIdentity = {
  javascript: { label: "JavaScript", icon: JavaScriptIcon, className: "" },
  react: { label: "React", icon: ReactIcon, className: "" },
  algorithms: {
    label: "Algorithms",
    icon: WorkflowIcon,
    className: "text-brand-algorithms",
  },
} as const;

const items: readonly GlobalNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
  },
];
function subjectItems(
  subject: "javascript" | "algorithms" | "react",
): readonly GlobalNavItem[] {
  const sections: GlobalNavItem[] = [
    {
      id: "learn",
      label: "Learn",
      href: `/${subject}/learn`,
      icon: LearnIcon,
      appearance: "text",
    },
  ];
  if (subject !== "react" || isReactPilotAvailable())
    sections.push({
      id: "practice",
      label: "Practice",
      href: `/${subject}/practice`,
      icon: PracticeIcon,
      appearance: "text",
    });
  return sections;
}
const allSectionItems = [
  ...subjectItems("javascript"),
  ...subjectItems("algorithms"),
  ...subjectItems("react"),
];
function NavLink(props: GlobalNavLinkProps) {
  const label = [...items, ...allSectionItems].find(
    (item) => item.href === props.href,
  )?.label;
  return <Link {...props} aria-label={props["aria-label"] ?? label} />;
}

export function SiteNav({ authConfigured }: { authConfigured: boolean }) {
  const pathname = usePathname();
  // Landing, authentication and focused workspaces omit the global navigation.
  if (
    pathname === "/" ||
    /^\/sign-(?:in|up)(?:\/|$)/.test(pathname) ||
    /^\/(?:javascript|algorithms|react)\/practice\/[^/]+\/?$/.test(pathname)
  )
    return null;
  const subject = (["javascript", "algorithms", "react"] as const).find(
    (id) => pathname === `/${id}` || pathname.startsWith(`/${id}/`),
  );
  const navigationItems = subject ? subjectItems(subject) : [];
  const identity = subject ? subjectIdentity[subject] : undefined;
  const SubjectIcon = identity?.icon;
  const activeItem = [...items, ...navigationItems].find((item) =>
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <GlobalNav
      key={subject ?? "application"}
      className="sticky top-0 z-40"
      brand={
        identity && SubjectIcon ? (
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button
              asChild
              variant="navigation"
              size="sm"
              className="min-h-11 lg:min-h-9"
            >
              <NavLink href="/dashboard">
                <BackIcon aria-hidden="true" data-icon="inline-start" />
                Dashboard
              </NavLink>
            </Button>
            <span
              data-slot="subject-identity"
              className="inline-flex min-w-0 items-center gap-2 border-s pl-3 text-sm"
            >
              <SubjectIcon
                aria-hidden="true"
                className={cn("size-5 shrink-0", identity.className)}
              />
              <span className="truncate">{identity.label}</span>
            </span>
          </div>
        ) : (
          <Link href="/" className="inline-flex max-w-full items-center gap-2">
            <BrandIcon className="size-5 shrink-0" />
            <span className="truncate">Code Atlas</span>
          </Link>
        )
      }
      items={navigationItems}
      leadingItems={subject ? [] : items}
      itemsAlign={subject ? "center" : "start"}
      mobileSections={Boolean(subject)}
      activeItemId={activeItem?.id}
      containerClassName="max-w-none"
      linkComponent={NavLink}
      actions={<NavAuth configured={authConfigured} />}
      utilities={<ThemeSwitcher />}
    />
  );
}
