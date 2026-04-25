/**
 * Idempotency guard for transaction submissions.
 *
 * Wraps an async operation so that concurrent calls issued before the
 * first one resolves are dropped rather than queued. This is the
 * correct semantics for one-shot blockchain transactions: a second click
 * while "Signing…" should be silently ignored, not enqueued.
 *
 * Usage:
 *   const guard = createSubmitGuard();
 *   await guard.run(() => signAndSubmit(tx));
 *
 *   // check from outside:
 *   if (guard.isSubmitting()) { ... }
 */

export interface SubmitGuard {
  /**
   * Run `fn` if no submission is currently in-flight.
   * Returns the result of `fn`, or `undefined` if a submission was
   * already in progress and this call was dropped.
   */
  run<T>(fn: () => Promise<T>): Promise<T | undefined>;

  /** True while a submission started by `run()` is still pending. */
  isSubmitting(): boolean;
}

export function createSubmitGuard(): SubmitGuard {
  let submitting = false;

  return {
    async run<T>(fn: () => Promise<T>): Promise<T | undefined> {
      if (submitting) return undefined;
      submitting = true;
      try {
        return await fn();
      } finally {
        submitting = false;
      }
    },

    isSubmitting() {
      return submitting;
    },
  };
}
