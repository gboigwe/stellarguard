import { describe, expect, it, vi } from "vitest";
import { createSubmitGuard } from "@/lib/submitGuard";

describe("submitGuard", () => {
  it("runs the function and returns its result", async () => {
    const guard = createSubmitGuard();
    const result = await guard.run(async () => 42);
    expect(result).toBe(42);
  });

  it("reports isSubmitting() true while running", async () => {
    const guard = createSubmitGuard();

    let resolveInner!: () => void;
    const innerPromise = new Promise<void>((res) => {
      resolveInner = res;
    });

    const runPromise = guard.run(async () => {
      await innerPromise;
      return "done";
    });

    expect(guard.isSubmitting()).toBe(true);
    resolveInner();
    await runPromise;
    expect(guard.isSubmitting()).toBe(false);
  });

  it("drops a concurrent call and returns undefined", async () => {
    const guard = createSubmitGuard();

    let resolveFirst!: () => void;
    const firstPromise = new Promise<void>((res) => {
      resolveFirst = res;
    });

    const secondFn = vi.fn(async () => "second");

    // First call starts but hasn't resolved yet
    const first = guard.run(async () => {
      await firstPromise;
      return "first";
    });

    // Second call while first is in-flight should be dropped
    const second = await guard.run(secondFn);

    expect(second).toBeUndefined();
    expect(secondFn).not.toHaveBeenCalled();

    resolveFirst();
    await first;
  });

  it("allows a second call after the first resolves", async () => {
    const guard = createSubmitGuard();

    const first = await guard.run(async () => "first");
    expect(first).toBe("first");

    const second = await guard.run(async () => "second");
    expect(second).toBe("second");
  });

  it("clears submitting state even when the function throws", async () => {
    const guard = createSubmitGuard();

    await expect(
      guard.run(async () => {
        throw new Error("tx failed");
      }),
    ).rejects.toThrow("tx failed");

    expect(guard.isSubmitting()).toBe(false);

    // Should be able to retry after failure
    const retry = await guard.run(async () => "retry ok");
    expect(retry).toBe("retry ok");
  });
});
