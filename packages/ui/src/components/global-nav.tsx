"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { MenuIcon, XIcon } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";

export type GlobalNavItem = {
  id: string;
  label: string;
  href: string;
  target?: ComponentPropsWithoutRef<"a">["target"];
  rel?: string;
};

export type GlobalNavLinkProps = ComponentPropsWithoutRef<"a"> & {
  href: string;
};

export type GlobalNavProps = Omit<
  ComponentPropsWithoutRef<"header">,
  "children"
> & {
  brand: ReactNode;
  /** Application-level links beside the brand, before section links in the mobile menu. */
  leadingItems?: readonly GlobalNavItem[];
  items?: readonly GlobalNavItem[];
  activeItemId?: string;
  /** Center the link group independently of branding and account controls on desktop. */
  itemsAlign?: "start" | "center";
  actions?: ReactNode;
  /** Always-visible controls, including on narrow screens. */
  utilities?: ReactNode;
  /** Defaults to a native anchor. Supply your router's Link in a client adapter. */
  linkComponent?: ElementType<GlobalNavLinkProps>;
  navigationLabel?: string;
  openMenuLabel?: string;
  closeMenuLabel?: string;
  containerClassName?: string;
};

/** Shared site navigation. Routes, branding, and account controls belong to its consumer. */
export function GlobalNav({
  brand,
  leadingItems = [],
  items = [],
  activeItemId,
  itemsAlign = "start",
  actions,
  utilities,
  linkComponent: LinkComponent = "a",
  navigationLabel = "Main navigation",
  openMenuLabel = "Open navigation",
  closeMenuLabel = "Close navigation",
  className,
  containerClassName,
  onKeyDown,
  onBlur,
  ...props
}: GlobalNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const linksId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const hasContent =
    leadingItems.length > 0 || items.length > 0 || Boolean(actions);
  const renderItem = (item: GlobalNavItem) => (
    <li key={item.id} className="min-w-0">
      <Button
        asChild
        variant={item.id === activeItemId ? "secondary" : "ghost"}
        className="w-full justify-start md:w-auto"
      >
        <LinkComponent
          href={item.href}
          aria-current={item.id === activeItemId ? "page" : undefined}
          target={item.target}
          rel={
            item.target === "_blank"
              ? ["noopener", "noreferrer", item.rel].filter(Boolean).join(" ")
              : item.rel
          }
          onClick={() => setMenuOpen(false)}
        >
          <span className="truncate">{item.label}</span>
        </LinkComponent>
      </Button>
    </li>
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Delegates Escape from descendant controls; the header itself is not focusable.
    <header
      data-slot="global-nav"
      className={cn(
        "shrink-0 border-b bg-background text-foreground",
        className,
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === "Escape" && menuOpen) {
          event.preventDefault();
          setMenuOpen(false);
          toggleRef.current?.focus();
        }
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (
          !event.defaultPrevented &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setMenuOpen(false);
        }
      }}
      {...props}
    >
      <nav
        aria-label={navigationLabel}
        className={cn(
          "mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-6 py-3",
          itemsAlign === "center" &&
            "md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
          containerClassName,
        )}
      >
        <div
          data-slot="global-nav-leading"
          className="flex min-w-0 flex-1 items-center gap-4 md:flex-initial"
        >
          <div
            data-slot="global-nav-brand"
            className="min-w-0 truncate font-semibold md:max-w-64"
          >
            {brand}
          </div>
          {leadingItems.length > 0 && (
            <ul
              data-slot="global-nav-leading-links"
              className="hidden shrink-0 items-center gap-1 md:flex"
            >
              {leadingItems.map(renderItem)}
            </ul>
          )}
        </div>

        {utilities && (
          <div
            className={cn(
              "flex shrink-0 items-center gap-2",
              hasContent
                ? "md:hidden"
                : itemsAlign === "center"
                  ? "md:col-start-3 md:justify-self-end"
                  : "md:ml-auto",
            )}
          >
            {utilities}
          </div>
        )}

        {hasContent && (
          <Button
            ref={toggleRef}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? closeMenuLabel : openMenuLabel}
            aria-expanded={menuOpen}
            aria-controls={linksId}
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-auto shrink-0 touch-manipulation md:hidden"
          >
            {menuOpen ? (
              <XIcon data-icon="inline-start" />
            ) : (
              <MenuIcon data-icon="inline-start" />
            )}
          </Button>
        )}

        {hasContent && (
          <div
            id={linksId}
            data-slot="global-nav-content"
            className={cn(
              "w-full min-w-0 flex-col gap-3",
              itemsAlign === "center"
                ? "md:contents"
                : "md:flex md:w-auto md:flex-1 md:flex-row md:items-center",
              menuOpen ? "flex" : "hidden",
            )}
          >
            {leadingItems.length > 0 && (
              <ul
                data-slot="global-nav-mobile-leading-links"
                className="flex min-w-0 flex-col gap-1 md:hidden"
              >
                {leadingItems.map(renderItem)}
              </ul>
            )}
            {items.length > 0 && (
              <ul
                data-slot="global-nav-links"
                className={cn(
                  "flex min-w-0 flex-col gap-1 md:flex-row md:flex-wrap",
                  itemsAlign === "center" &&
                    "md:col-start-2 md:row-start-1 md:justify-self-center",
                )}
              >
                {items.map(renderItem)}
              </ul>
            )}
            {(actions || utilities) && (
              <div
                data-slot="global-nav-actions"
                className={cn(
                  "flex flex-wrap items-center gap-2",
                  itemsAlign === "center"
                    ? "md:col-start-3 md:row-start-1 md:justify-self-end"
                    : "md:ml-auto",
                )}
              >
                {utilities && (
                  <div className="hidden shrink-0 items-center gap-2 md:flex">
                    {utilities}
                  </div>
                )}
                {actions}
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
