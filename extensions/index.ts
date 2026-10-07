/**
 * pi-today — Date section extension for pi
 *
 * Adds today's date to the system prompt (as a `<date>` section) so the LLM
 * always knows the current date.
 *
 * The date is declared as a system prompt *section* on every
 * `before_agent_start`. pi persists section changes into the transcript once
 * (a system update message) and the diff converges afterwards, so the
 * rendered system prompt is byte-stable for the rest of the session and the
 * provider's prompt cache is preserved.
 *
 * (A one-shot `before_agent_start` systemPrompt override would not work: pi
 * drops forced prompts on the next user prompt, which would change the system
 * prompt and break the cache.)
 *
 * The date is computed once per session start (startup, /new, resume, fork,
 * reload) and fixed for the session's duration, so a session that spans
 * midnight does not invalidate the cache. Resuming a session on another day
 * updates the section once.
 *
 * Emits "today:date" via pi.events so other extensions (like pi-system-prompt)
 * can display the date in their output.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  let datePrefix = "";

  // Compute the date once per session start and fix it for the session.
  pi.on("session_start", async (_event, _ctx) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    datePrefix = `Current date: ${dateStr}`;
    pi.events.emit("today:date", datePrefix);
  });

  // Re-declare the date section on every turn. Once pi has persisted it in
  // the transcript the diff is empty, so requests stay byte-identical.
  pi.on("before_agent_start", async (event, _ctx) => {
    if (!datePrefix) return;
    event.systemPromptOptions.sections.date = datePrefix;
  });
}
