import { z } from "zod";

/** One decoded message, in serial-decoder's JSON Lines format. */
export const readingSchema = z.object({
  id: z.number().int().min(0).max(255), // the packet's one-byte message ID
  message: z.string().min(1),
  values: z.record(z.string(), z.number()),
});

export type Reading = z.infer<typeof readingSchema>;

/** Parses one line of JSON; returns null for anything that isn't a valid reading. */
export function parseReading(line: string): Reading | null {
  let data: unknown;
  try {
    data = JSON.parse(line);
  } catch {
    return null;
  }
  const result = readingSchema.safeParse(data);
  return result.success ? result.data : null;
}
