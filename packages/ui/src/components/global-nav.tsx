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
  icon?: ElementType;
  appearance?: "button" | "text";
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
  /** Keep section links in a second row on mobile; the disclosure contains account actions. */
  mobileSections?: boolean;
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
  mobileSections = false,
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
  const hasDisclosure =
    leadingItems.length > 0 ||
    (!mobileSections && items.length > 0) ||
    Boolean(actions);
  const renderItem = (item: GlobalNavItem) => {
    const Icon = item.icon;
    return (
      <li key={item.id} className="min-w-0">
        <Button
          asChild
          variant={
            item.appearance === "text"
              ? "navigation"
              : item.id === activeItemId
                ? "secondary"
                : "ghost"
          }
          className={cn(
            "w-full justify-start md:w-auto",
            mobileSections && "min-h-11 w-auto justify-center lg:min-h-9",
          )}
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
            {Icon && <Icon aria-hidden="true" data-icon="inline-start" />}
            <span className="truncate">{item.label}</span>
          </LinkComponent>
        </Button>
      </li>
    );
  };
  const sectionLinks = items.length > 0 && (
    <ul
      data-slot="global-nav-links"
      className={cn(
        "flex min-w-0 gap-1",
        mobileSections
          ? "col-start-1 row-start-2 flex-wrap lg:col-start-2 lg:row-start-1 lg:justify-self-center"
          : "flex-col md:flex-row md:flex-wrap",
        !mobileSections &&
          itemsAlign === "center" &&
          "md:col-start-2 md:row-start-1 md:justify-self-center",
      )}
    >
      {items.map(renderItem)}
    </ul>
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
          mobileSections
            ? "grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-1 px-4 md:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-4"
            : itemsAlign === "center" &&
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
            className={cn(
              "min-w-0 font-semibold",
              !mobileSections && "truncate md:max-w-64",
            )}
          >
            {brand}
          </div>
          {leadingItems.length > 0 && (
            <ul
              data-slot="global-nav-leading-links"
              className={cn(
                "hidden shrink-0 items-center gap-1",
                mobileSections ? "lg:flex" : "md:flex",
              )}
            >
              {leadingItems.map(renderItem)}
            </ul>
          )}
        </div>

        {utilities && (
          <div
            className={cn(
              "flex shrink-0 items-center gap-2",
              mobileSections
                ? "col-start-2 row-start-1 justify-self-end lg:hidden"
                : hasContent
                  ? "md:hidden"
                  : itemsAlign === "center"
                    ? "md:col-start-3 md:justify-self-end"
                    : "md:ml-auto",
            )}
          >
            {utilities}
          </div>
        )}

        {mobileSections && sectionLinks}

        {hasDisclosure && (
          <Button
            ref={toggleRef}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? closeMenuLabel : openMenuLabel}
            aria-expanded={menuOpen}
            aria-controls={linksId}
            onClick={() => setMenuOpen((open) => !open)}
            className={cn(
              "ml-auto shrink-0 touch-manipulation",
              mobileSections
                ? "col-start-2 row-start-2 lg:hidden"
                : "md:hidden",
            )}
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
              mobileSections
                ? "col-span-2 lg:contents"
                : itemsAlign === "center"
                  ? "md:contents"
                  : "md:flex md:w-auto md:flex-1 md:flex-row md:items-center",
              menuOpen ? "flex" : "hidden",
            )}
          >
            {leadingItems.length > 0 && (
              <ul
                data-slot="global-nav-mobile-leading-links"
                className={cn(
                  "flex min-w-0 flex-col gap-1",
                  mobileSections ? "lg:hidden" : "md:hidden",
                )}
              >
                {leadingItems.map(renderItem)}
              </ul>
            )}
            {!mobileSections && sectionLinks}
            {(actions || utilities) && (
              <div
                data-slot="global-nav-actions"
                className={cn(
                  "flex flex-wrap items-center gap-2",
                  mobileSections
                    ? "lg:col-start-3 lg:row-start-1 lg:justify-self-end"
                    : itemsAlign === "center"
                      ? "md:col-start-3 md:row-start-1 md:justify-self-end"
                      : "md:ml-auto",
                )}
              >
                {utilities && (
                  <div
                    className={cn(
                      "hidden shrink-0 items-center gap-2",
                      mobileSections ? "lg:flex" : "md:flex",
                    )}
                  >
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
