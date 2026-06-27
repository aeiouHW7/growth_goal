import { spawn } from "child_process";

const CLAUDE_TIMEOUT_MS = 120_000;

export interface ClaudeCallOptions {
  /** Prompt text sent to Claude via stdin */
  prompt: string;
  /** Timeout in ms (default 120s) */
  timeout?: number;
  /** Expected output schema — parsed from JSON in response */
  schema?: "json" | "text";
}

/**
 * Call Claude CLI via stdin pipe.
 * Follows the existing pattern from Bridge (auto-processor.cjs).
 * Returns the parsed JSON object (schema="json") or raw text (schema="text").
 */
export async function callClaude<T = Record<string, unknown>>(
  options: ClaudeCallOptions,
): Promise<T> {
  const {
    prompt,
    timeout = CLAUDE_TIMEOUT_MS,
    schema = "json",
  } = options;

  return new Promise((resolve, reject) => {
    const proc = spawn("claude", ["-p", "-"], {
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error("Claude CLI timeout after " + timeout + "ms"));
    }, timeout);

    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    proc.on("error", (e: Error) => {
      clearTimeout(timer);
      reject(new Error("Claude spawn error: " + e.message));
    });

    proc.on("close", (code: number | null) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(
          new Error(
            "Claude CLI exit code " + code + ": " + stderr.slice(0, 200),
          ),
        );
        return;
      }

      if (schema === "text") {
        resolve(stdout.trim() as unknown as T);
        return;
      }

      // Parse JSON from response (find first {…} block)
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          resolve(JSON.parse(jsonMatch[0]) as T);
        } catch {
          reject(new Error("Failed to parse Claude response as JSON"));
        }
      } else {
        reject(new Error("No JSON found in Claude response"));
      }
    });

    proc.stdin.write(prompt);
    proc.stdin.end();
  });
}
