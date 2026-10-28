"use client";

import { useRef, useState } from "react";
import { designCharacterVoices, loadVoices, playCurrentVoice, playSample, saveVoiceDescription, restoreOriginal, chooseSample } from "@/app/actions/voices";
import type { VoiceRow } from "@/lib/voice-studio";

type Busy = { id: string; what: string } | null;

/**
 * One case's voices. Loaded when opened (so the Admin page stays fast). For
 * each character: the description voices are designed from, three samples per
 * design, and a button to make one of them the voice every player hears.
 */
export function VoiceStudio({ caseId, count }: { caseId: string; count: number }) {
  const [rows, setRows] = useState<VoiceRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const stop = useRef(false);
  const [running, setRunning] = useState<null | { done: number; total: number }>(null);

  const note = (id: string, text: string) => setNotes((n) => ({ ...n, [id]: text }));

  const open = async () => {
    setError(null);
    const r = await loadVoices(caseId).catch(() => ({ error: "The connection dropped. Try again." }));
    if ("error" in r) setError(r.error);
    else setRows(r.rows);
  };

  const play = async (key: string, get: () => Promise<{ src: string } | { error: string }>) => {
    audio.current?.pause();
    if (playing === key) {
      setPlaying(null);
      return;
    }
    setPlaying(key);
    const r = await get().catch(() => ({ error: "The connection dropped." }));
    if ("error" in r) {
      setPlaying(null);
      setError(r.error);
      return;
    }
    const a = new Audio(r.src);
    audio.current = a;
    a.onended = () => setPlaying((p) => (p === key ? null : p));
    void a.play().catch(() => setPlaying(null));
  };

  const design = async (row: VoiceRow) => {
    setBusy({ id: row.characterId, what: "design" });
    note(row.characterId, "Designing three voices… (about half a minute)");
    const r = await designCharacterVoices(caseId, row.characterId, drafts[row.characterId] ?? row.description).catch(() => ({ error: "The connection dropped. Try again." }));
    setBusy(null);
    if ("error" in r) {
      note(row.characterId, r.error);
      return false;
    }
    setRows(r.rows);
    note(row.characterId, "Three new samples below. Play them and choose one.");
    return true;
  };

  const designAll = async () => {
    if (!rows) return;
    const todo = rows.filter((r) => !r.previews.length);
    if (!todo.length) return;
    if (!window.confirm(`Design three sample voices for each of ${todo.length} character(s) without samples? Each design uses a little ElevenLabs credit.`)) return;
    stop.current = false;
    setRunning({ done: 0, total: todo.length });
    for (let i = 0; i < todo.length; i++) {
      if (stop.current) break;
      await design(todo[i]);
      setRunning({ done: i + 1, total: todo.length });
    }
    setRunning(null);
  };

  const choose = async (row: VoiceRow, previewId: string) => {
    setBusy({ id: row.characterId, what: "choose" });
    note(row.characterId, "Saving the voice to ElevenLabs…");
    const r = await chooseSample(caseId, previewId).catch(() => ({ error: "The connection dropped. Try again." }));
    setBusy(null);
    if ("error" in r) note(row.characterId, r.error);
    else {
      setRows(r.rows);
      note(row.characterId, `${row.name} now speaks in this voice for every player. Lines are recorded afresh as they're heard.`);
    }
  };

  const original = async (row: VoiceRow) => {
    setBusy({ id: row.characterId, what: "original" });
    const r = await restoreOriginal(caseId, row.characterId).catch(() => ({ error: "The connection dropped. Try again." }));
    setBusy(null);
    if ("error" in r) note(row.characterId, r.error);
    else {
      setRows(r.rows);
      note(row.characterId, "Back to the case's own voice.");
    }
  };

  if (!rows)
    return (
      <div className="mt-4">
        <button type="button" onClick={open} className="rounded-[2px] border border-white/20 px-4 py-2 text-sm hover:border-brass">
          Open {count} voice{count === 1 ? "" : "s"}
        </button>
        {error ? <p className="mt-2 text-sm text-[#e2a7a2]">{error}</p> : null}
      </div>
    );

  const without = rows.filter((r) => !r.previews.length).length;
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={Boolean(running) || Boolean(busy) || !without}
          onClick={designAll}
          className="rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-50"
        >
          {running ? `Designing ${running.done + 1} of ${running.total}` : without ? `Design samples for everyone without (${without})` : "Everyone has samples"}
        </button>
        {running ? (
          <button type="button" onClick={() => (stop.current = true)} className="text-sm text-smoke underline-offset-4 hover:text-paper hover:underline">
            Stop after this one
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-sm text-[#e2a7a2]">{error}</p> : null}
      <ul className="mt-5 divide-y divide-rule/60 border-y border-rule">
        {rows.map((row) => {
          const draft = drafts[row.characterId] ?? row.description;
          const mine = busy?.id === row.characterId;
          return (
            <li key={row.characterId} className="space-y-3 py-5 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p>
                  <span className="font-serif text-lg text-paper">{row.name}</span> <span className="text-smoke">{row.role}</span>
                </p>
                <p className="font-mono text-xs text-smoke">{row.current.chosen ? "Designed voice, live" : "The case's own voice"}</p>
              </div>
              <label className="block">
                <span className="text-xs text-smoke">Voice description {row.edited || draft !== row.description ? "(edited)" : "(the case's direction)"}</span>
                <textarea
                  value={draft}
                  onChange={(e) => setDrafts((d) => ({ ...d, [row.characterId]: e.target.value }))}
                  onBlur={() => draft !== row.description && void saveVoiceDescription(caseId, row.characterId, draft)}
                  rows={3}
                  className="mt-1 w-full rounded-[2px] border border-white/15 bg-[#14181c] p-2 text-paper"
                />
              </label>
              {draft !== row.direction ? (
                <button type="button" onClick={() => setDrafts((d) => ({ ...d, [row.characterId]: row.direction }))} className="text-xs text-smoke underline-offset-4 hover:text-paper hover:underline">
                  Back to the case&apos;s direction
                </button>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={Boolean(busy) || Boolean(running)}
                  onClick={() => void design(row)}
                  className="rounded-[2px] bg-brass px-3 py-1.5 font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-50"
                >
                  {mine && busy?.what === "design" ? "Designing…" : row.previews.length ? "Design three more" : "Design three voices"}
                </button>
                <button type="button" onClick={() => void play(`current-${row.characterId}`, () => playCurrentVoice(caseId, row.characterId))} className="text-brass underline-offset-4 hover:underline">
                  {playing === `current-${row.characterId}` ? "Stop" : "Hear the voice players hear now"}
                </button>
                {row.current.chosen ? (
                  <button type="button" disabled={Boolean(busy)} onClick={() => void original(row)} className="text-smoke underline-offset-4 hover:text-paper hover:underline disabled:opacity-50">
                    Use the case&apos;s own voice
                  </button>
                ) : null}
              </div>
              {notes[row.characterId] ? <p className="text-xs text-smoke">{notes[row.characterId]}</p> : null}
              {row.previews.length ? (
                <ul className="grid gap-2 sm:grid-cols-3">
                  {row.previews.slice(0, 9).map((p, i) => (
                    <li key={p.id} className={`rounded-[2px] border p-2 ${p.chosen ? "border-brass" : "border-white/10"}`}>
                      <p className="font-mono text-xs text-smoke">
                        Sample {row.previews.length - i}
                        {p.chosen ? ", live" : ""}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-3">
                        <button type="button" onClick={() => void play(p.id, () => playSample(p.id))} className="text-brass underline-offset-4 hover:underline">
                          {playing === p.id ? "Stop" : "Play"}
                        </button>
                        {p.chosen ? null : (
                          <button type="button" disabled={Boolean(busy)} onClick={() => void choose(row, p.id)} className="text-paper underline-offset-4 hover:underline disabled:opacity-50">
                            Use this voice
                          </button>
                        )}
                      </div>
                      {p.description !== draft ? <p className="mt-1 line-clamp-2 text-[0.7rem] text-smoke" title={p.description}>{p.description}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
