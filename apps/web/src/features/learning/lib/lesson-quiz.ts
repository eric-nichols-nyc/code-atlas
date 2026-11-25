export type QuizQuestion = {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly [string, string, string, string];
  readonly correctIndex: 0 | 1 | 2 | 3;
  readonly explanation: string;
};
