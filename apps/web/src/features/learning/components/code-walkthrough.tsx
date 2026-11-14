import {
  availableWalkthroughSource,
  type CodeWalkthroughDefinition,
  validateCodeWalkthrough,
} from "../lib/code-walkthrough";
import { prepareCodeWalkthrough } from "../server/prepare-code-walkthrough";
import styles from "./code-walkthrough.module.css";
import { CodeWalkthroughClient } from "./code-walkthrough-client";

export function CodeWalkthrough({ definition }: { definition: unknown }) {
  if (validateCodeWalkthrough(definition).length) {
    const source = availableWalkthroughSource(definition);
    return (
      <section
        className={styles.walkthrough}
        aria-label="Guided example unavailable"
      >
        <p className={styles.description}>Guided walkthrough unavailable.</p>
        {source && (
          <section
            className={styles.code}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard focus enables horizontal source scrolling.
            tabIndex={0}
            aria-label="JavaScript example"
          >
            <pre data-walkthrough-code>
              <code>{source}</code>
            </pre>
          </section>
        )}
      </section>
    );
  }
  const prepared = prepareCodeWalkthrough(
    definition as CodeWalkthroughDefinition,
  );
  return <CodeWalkthroughClient key={prepared.id} walkthrough={prepared} />;
}
