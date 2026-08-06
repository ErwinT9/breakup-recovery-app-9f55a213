import { createServerFn } from "@tanstack/react-start";
export const pingPlain = createServerFn({ method: "POST" }).handler(async () => ({ ok: true }));
