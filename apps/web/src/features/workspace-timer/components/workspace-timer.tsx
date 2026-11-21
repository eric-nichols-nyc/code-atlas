"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import {
  ChevronLeftIcon,
  Clock3Icon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  TimerIcon,
} from "@workspace/ui/components/icons";
import { Input } from "@workspace/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { useEffect, useId, useRef, useState } from "react";
import { formatTime, useWorkspaceTimer } from "../hooks/use-workspace-timer";

export function WorkspaceTimer() {
  const timer = useWorkspaceTimer();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hours, setHours] = useState("01");
  const [minutes, setMinutes] = useState("00");
  const trigger = useRef<HTMLButtonElement>(null);
  const focusAfterCollapse = useRef(false);
  useEffect(() => {
    if (!expanded && focusAfterCollapse.current) {
      trigger.current?.focus();
      focusAfterCollapse.current = false;
    }
  }, [expanded]);
  const id = useId();
  const hoursValid = /^\d{1,2}$/.test(hours);
  const minutesValid = /^\d{1,2}$/.test(minutes) && Number(minutes) <= 59;
  const duration = Number(hours) * 3600 + Number(minutes) * 60;
  const durationValid = hoursValid && minutesValid && duration > 0;
  const active = timer.phase !== "idle";
  const label = timer.mode === "stopwatch" ? "Stopwatch" : "Timer";
  const Icon = timer.mode === "stopwatch" ? TimerIcon : Clock3Icon;
  const reveal = () => {
    setExpanded(true);
    setOpen(false);
  };
  const controls = (
    <fieldset
      aria-label={`${label} controls`}
      className="flex min-w-0 items-center gap-1 rounded-lg border bg-muted/40 px-1"
    >
      {expanded && !open && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Collapse timer"
          title="Collapse timer"
          onClick={() => {
            focusAfterCollapse.current = true;
            setExpanded(false);
          }}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={
          timer.running
            ? `Pause ${label.toLowerCase()}`
            : timer.phase === "finished"
              ? "Restart timer"
              : `Resume ${label.toLowerCase()}`
        }
        title={timer.running ? "Pause" : "Start / resume"}
        onClick={() => (timer.running ? timer.pause() : timer.start())}
      >
        {timer.running ? (
          <PauseIcon aria-hidden="true" />
        ) : (
          <PlayIcon aria-hidden="true" />
        )}
      </Button>
      <span
        role="timer"
        aria-label={`${label} time`}
        className="min-w-[8ch] shrink-0 font-mono text-sm tabular-nums"
      >
        {formatTime(timer.seconds)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Reset ${label.toLowerCase()}`}
        title="Reset"
        onClick={() => {
          timer.reset();
          if (open) setOpen(false);
        }}
      >
        <RotateCcwIcon aria-hidden="true" />
      </Button>
    </fieldset>
  );

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={trigger}
            type="button"
            variant={active ? "secondary" : "outline"}
            size="icon"
            aria-label="Timer"
            title="Stopwatch and timer"
          >
            <Icon aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          collisionPadding={12}
          aria-label="Stopwatch and timer"
          className="flex w-[226px] max-w-[calc(100vw-24px)] flex-col gap-2 rounded-2xl p-3"
        >
          <ToggleGroup
            type="single"
            variant="outline"
            size="card"
            spacing={2}
            value={timer.mode}
            aria-label="Timer mode"
            className="grid w-full grid-cols-2"
            onValueChange={(mode) => {
              if (mode === "stopwatch" || mode === "timer") {
                timer.setMode(mode);
                setExpanded(false);
              }
            }}
          >
            <ToggleGroupItem value="stopwatch" aria-label="Stopwatch">
              <TimerIcon aria-hidden="true" className="text-info" />
              Stopwatch
            </ToggleGroupItem>
            <ToggleGroupItem value="timer" aria-label="Countdown timer">
              <Clock3Icon aria-hidden="true" className="text-warning" />
              Timer
            </ToggleGroupItem>
          </ToggleGroup>
          {active ? (
            <>
              {controls}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={reveal}
              >
                Show in toolbar
              </Button>
            </>
          ) : (
            <form
              className="flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (timer.mode === "timer" && !durationValid) return;
                timer.start(timer.mode === "timer" ? duration : undefined);
                reveal();
              }}
            >
              {timer.mode === "timer" && (
                <>
                  <FieldGroup className="flex-row items-center gap-2">
                    <Field
                      orientation="horizontal"
                      className="gap-1.5"
                      data-invalid={!hoursValid}
                    >
                      <Input
                        id={`${id}-hours`}
                        type="text"
                        inputMode="numeric"
                        value={hours}
                        aria-invalid={!hoursValid}
                        aria-describedby={
                          !durationValid ? `${id}-error` : undefined
                        }
                        onChange={(event) => setHours(event.target.value)}
                        className="w-11 shrink-0 px-1 text-center"
                      />
                      <FieldLabel htmlFor={`${id}-hours`}>
                        <span aria-hidden="true">hr</span>
                        <span className="sr-only">Hours</span>
                      </FieldLabel>
                    </Field>
                    <Field
                      orientation="horizontal"
                      className="gap-1.5"
                      data-invalid={!minutesValid}
                    >
                      <Input
                        id={`${id}-minutes`}
                        type="text"
                        inputMode="numeric"
                        value={minutes}
                        aria-invalid={!minutesValid}
                        aria-describedby={
                          !durationValid ? `${id}-error` : undefined
                        }
                        onChange={(event) => setMinutes(event.target.value)}
                        className="w-11 shrink-0 px-1 text-center"
                      />
                      <FieldLabel htmlFor={`${id}-minutes`}>
                        <span aria-hidden="true">min</span>
                        <span className="sr-only">Minutes</span>
                      </FieldLabel>
                    </Field>
                  </FieldGroup>
                  {!durationValid && (
                    <FieldError id={`${id}-error`}>
                      Enter 0–99 hours and 0–59 minutes, with at least one
                      minute.
                    </FieldError>
                  )}
                </>
              )}
              <Button
                type="submit"
                variant="contrast"
                disabled={timer.mode === "timer" && !durationValid}
                className="w-full rounded-xl"
              >
                <PlayIcon aria-hidden="true" data-icon="inline-start" />
                Start {label}
              </Button>
            </form>
          )}
        </PopoverContent>
      </Popover>
      {expanded && !open && controls}
      <span
        role="status"
        className={
          timer.phase === "finished" ? "text-xs text-interactive" : "sr-only"
        }
      >
        {timer.phase === "finished" ? "Time's up." : ""}
      </span>
    </div>
  );
}
