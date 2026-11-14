import { cn } from "@workspace/ui/lib/utils";
import type { SVGProps } from "react";

export function JavaScriptIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={cn("text-brand-javascript", className)}
      {...props}
    >
      <rect width="24" height="24" rx="3" fill="currentColor" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="13"
        fontWeight="700"
        className="fill-brand-javascript-foreground"
      >
        JS
      </text>
    </svg>
  );
}

export function ReactIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="-12 -12 24 24"
      fill="none"
      className={cn("text-brand-react", className)}
      {...props}
    >
      <circle r="2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.1">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}
