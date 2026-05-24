export type ActionState = {
  ok: boolean;
  message: string;
  /** When set, the client wrapper navigates here after toasting. */
  redirect?: string;
  /** Bumps every time an action runs so useEffect re-fires on identical messages. */
  ts?: number;
};

export const idleState: ActionState = { ok: true, message: "" };

export const okState = (message: string, redirect?: string): ActionState => ({
  ok: true,
  message,
  redirect,
  ts: Date.now(),
});

export const errorState = (message: string): ActionState => ({
  ok: false,
  message,
  ts: Date.now(),
});
