import { useEffect, useState } from "react";

const playbackDelay = 1600;

export function useWalkthroughPlayback<
  Example extends { readonly steps: readonly [unknown, ...unknown[]] },
>(examples: readonly [Example, ...Example[]]) {
  const [{ exampleIndex, index, playing }, setPlayback] = useState({
    exampleIndex: 0,
    index: 0,
    playing: false,
  });
  const example = examples[exampleIndex] ?? examples[0];
  const total = example.steps.length;
  const lastIndex = total - 1;

  useEffect(() => {
    if (!playing) return;
    const timeout = window.setTimeout(() => {
      setPlayback((current) => {
        if (
          !current.playing ||
          current.exampleIndex !== exampleIndex ||
          current.index !== index
        )
          return current;
        const next = current.index + 1;
        return { ...current, index: next, playing: next < lastIndex };
      });
    }, playbackDelay);
    return () => window.clearTimeout(timeout);
  }, [exampleIndex, index, lastIndex, playing]);

  function seek(index: number) {
    setPlayback((current) => ({ ...current, index, playing: false }));
  }

  function toggle() {
    setPlayback((current) =>
      current.index === lastIndex
        ? current
        : { ...current, playing: !current.playing },
    );
  }

  function selectExample(exampleIndex: number) {
    setPlayback((current) =>
      current.exampleIndex === exampleIndex
        ? current
        : { exampleIndex, index: 0, playing: false },
    );
  }

  return {
    example,
    exampleIndex,
    index,
    playing,
    total,
    seek,
    toggle,
    selectExample,
  };
}
