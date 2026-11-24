import type { PreparedWalkthrough } from "../lib/code-walkthrough";
import styles from "./code-walkthrough.module.css";

export function WalkthroughSource({
  codeLines,
  activeLines,
  label,
}: {
  codeLines: PreparedWalkthrough["codeLines"];
  activeLines: readonly number[];
  label: string;
}) {
  return (
    <section
      className={styles.code}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard focus enables horizontal source scrolling.
      tabIndex={0}
      aria-label={label}
    >
      <pre data-walkthrough-code>
        <code>
          {codeLines.map(({ tokens, number }) => (
            <span
              key={number}
              className={styles.line}
              data-line={number}
              data-active={activeLines.includes(number)}
            >
              <span className={styles.lineNumber} aria-hidden="true">
                {number}
              </span>
              <span>
                {tokens.map((token) => (
                  <span
                    key={token.offset}
                    className={token.role ? styles[token.role] : undefined}
                  >
                    {token.text}
                  </span>
                ))}
                {number < codeLines.length ? "\n" : ""}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </section>
  );
}
