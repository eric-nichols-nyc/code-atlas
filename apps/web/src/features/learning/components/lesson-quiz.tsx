"use client";

import { Button } from "@workspace/ui/components/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  RotateCcwIcon,
  XIcon,
} from "@workspace/ui/components/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { type ReactNode, useCallback, useId, useRef, useState } from "react";
import type { QuizQuestion } from "../lib/lesson-quiz";
import styles from "./lesson-quiz.module.css";

export function LessonQuiz({
  questions,
}: {
  questions: readonly [QuizQuestion, ...QuizQuestion[]];
}) {
  const headingId = useId();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const question = questions[index];
  const selected = question ? answers[question.id] : undefined;
  const score = question
    ? 0
    : questions.filter((item) => answers[item.id] === item.correctIndex).length;

  const cardProps = {
    question,
    selected,
    score,
    index,
    total: questions.length,
    onAnswer: (choice: number) => {
      if (!question) return;
      setAnswers((current) =>
        current[question.id] === undefined
          ? { ...current, [question.id]: choice }
          : current,
      );
    },
    onNavigate: setIndex,
    onRestart: () => {
      setAnswers({});
      setIndex(0);
    },
  };

  return (
    <section id="quiz" className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId}>Quiz</h2>
      <Sheet>
        <QuizCard
          {...cardProps}
          expand={
            <SheetTrigger asChild>
              <Button
                aria-label="Expand quiz"
                title="Expand quiz"
                size="icon"
                variant="outline"
              >
                <ArrowUpRightIcon aria-hidden="true" />
              </Button>
            </SheetTrigger>
          }
        />
        <SheetContent className="w-full overflow-y-auto p-4 pt-12 sm:max-w-2xl sm:p-6 sm:pt-12">
          <SheetTitle className="sr-only">Introduction Quiz</SheetTitle>
          <SheetDescription className="sr-only">
            Expanded view of the Sliding Window quiz
          </SheetDescription>
          <QuizCard {...cardProps} />
        </SheetContent>
      </Sheet>
    </section>
  );
}

function QuizCard({
  question,
  selected,
  score,
  index,
  total,
  onAnswer,
  onNavigate,
  onRestart,
  expand,
}: {
  question: QuizQuestion | undefined;
  selected: number | undefined;
  score: number;
  index: number;
  total: number;
  onAnswer: (choice: number) => void;
  onNavigate: (index: number) => void;
  onRestart: () => void;
  expand?: ReactNode;
}) {
  const focusOnMove = useRef(false);
  const titleId = useId();
  const answered = selected !== undefined;
  const position = Math.min(index + 1, total);
  const correct = question && selected === question.correctIndex;

  const focusQuestion = useCallback((heading: HTMLHeadingElement | null) => {
    if (!heading || !focusOnMove.current) return;
    focusOnMove.current = false;
    heading.focus();
  }, []);

  function moveTo(nextIndex: number) {
    focusOnMove.current = true;
    onNavigate(nextIndex);
  }

  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h3>Introduction Quiz</h3>
          {expand}
        </div>
        <div className={styles.progressRow}>
          <progress aria-label="Quiz position" value={position} max={total} />
          <span>
            {position} / {total}
          </span>
        </div>
      </header>
      <div className={styles.body}>
        <h4
          key={index}
          id={titleId}
          ref={focusQuestion}
          tabIndex={-1}
          className={styles.prompt}
        >
          {question?.prompt ?? "Quiz complete"}
        </h4>
        {question ? (
          <>
            <ul className={styles.options} aria-labelledby={titleId}>
              {question.options.map((option, choice) => {
                const active = choice === selected;
                const state = answered
                  ? choice === question.correctIndex
                    ? "correct"
                    : active
                      ? "incorrect"
                      : undefined
                  : undefined;
                return (
                  <li key={option}>
                    <Button
                      variant="outline"
                      aria-pressed={active}
                      aria-disabled={answered}
                      data-answer={state}
                      className={styles.option}
                      onClick={() => onAnswer(choice)}
                    >
                      <span className={styles.letter} aria-hidden="true">
                        {"ABCD"[choice]}
                      </span>
                      <span>{option}</span>
                      {state === "correct" && <CheckIcon aria-hidden="true" />}
                      {state === "incorrect" && <XIcon aria-hidden="true" />}
                    </Button>
                  </li>
                );
              })}
            </ul>
            <div aria-live="polite" aria-atomic="true">
              {answered && (
                <div
                  className={styles.feedback}
                  data-answer={correct ? "correct" : "incorrect"}
                >
                  <strong>{correct ? "Correct" : "Incorrect"}</strong>
                  <p>{question.explanation}</p>
                </div>
              )}
            </div>
            <footer className={styles.footer}>
              <Button
                variant="outline"
                className="text-base"
                disabled={index === 0}
                onClick={() => moveTo(index - 1)}
              >
                <ArrowLeftIcon aria-hidden="true" /> Previous
              </Button>
              <Button
                className="text-base"
                disabled={!answered}
                onClick={() => moveTo(index + 1)}
              >
                {index === total - 1 ? "Finish quiz" : "Next"}
                <ArrowRightIcon aria-hidden="true" />
              </Button>
            </footer>
          </>
        ) : (
          <>
            <p className={styles.score}>
              You answered{" "}
              <strong>
                {score} of {total}
              </strong>{" "}
              questions correctly.
            </p>
            <footer className={styles.footer}>
              <Button
                className="text-base"
                variant="outline"
                onClick={() => moveTo(0)}
              >
                Review answers
              </Button>
              <Button
                className="text-base"
                onClick={() => {
                  focusOnMove.current = true;
                  onRestart();
                }}
              >
                <RotateCcwIcon aria-hidden="true" />
                Restart quiz
              </Button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
