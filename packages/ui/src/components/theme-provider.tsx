"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider(
  props: ComponentProps<typeof NextThemesProvider>,
) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      themes={["light", "dark", "dark-purple"]}
      enableSystem
      enableColorScheme={false}
      disableTransitionOnChange
      {...props}
    />
  );
}

export { useTheme } from "next-themes";
