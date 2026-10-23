"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { setGroupName } from "@/app/actions/leaderboard";
import { hostLobbyStatus, removePartyGuest, startParty, type LobbyStatus } from "@/app/actions/party";
import { SubmitButton } from "@/components/form";
import { buttonClass } from "@/components/ui";

/** The lobby under the QR code: how many are at the table, and the button that starts it for everyone. */
export function HostLobby({ caseId, initial, host, max, groupName }: { caseId: string; initial: LobbyStatus; host: string; max: number; groupName: string }) {
  const [lobby, setLobby] = useState(initial);
  const [name, setName] = useState(groupName);
  const [saved, setSaved] = useState(groupName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, startSaving] = useTransition();
  const saveName = () =>
    startSaving(async () => {
      setNameError(null);
      const res = await setGroupName(name);
      if ("error" in res) setNameError(res.error ?? "That name can't be used.");
      else setSaved(res.name ?? "");
    });

  useEffect(() => {
    let stopped = false;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      const next = await hostLobbyStatus().catch(() => null);
      if (!stopped && next) setLobby(next);
    };
    const t = setInterval(tick, 2000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, []);

  const count = lobby.guests.length + 1;
  return (
    <div className="mt-6 border-t border-rule pt-5">
      <p className="font-serif text-xl" role="status" aria-live="polite">
        {count} in the lobby
      </p>
      <ul className="mt-2 flex flex-wrap justify-center gap-1.5 text-sm">
        <li className="rounded-[2px] border border-brass/50 px-2 py-0.5 text-brass">{host} (host)</li>
        {lobby.guests.map((g) => (
          <li key={g.id} className="flex items-center gap-1 rounded-[2px] border border-white/15 px-2 py-0.5">
            {g.name}
            <form
              action={async (fd) => {
                await removePartyGuest(fd);
                setLobby((l) => ({ ...l, guests: l.guests.filter((x) => x.id !== g.id) }));
              }}
            >
              <input type="hidden" name="guestId" value={g.id} />
              <button type="submit" aria-label={`Remove ${g.name}`} className="px-1 text-smoke hover:text-paper">
                ×
              </button>
            </form>
          </li>
        ))}
      </ul>
      {count >= max ? <p className="mt-2 text-xs text-smoke">The table is full.</p> : null}
      <form
        className="mt-5 text-left"
        onSubmit={(e) => {
          e.preventDefault();
          saveName();
        }}
      >
        <label htmlFor="group-name" className="text-sm text-smoke">
          Name your group <span className="text-xs">(for the leaderboard)</span>
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="group-name"
            className="field min-w-0 flex-1"
            maxLength={30}
            placeholder="The Night Shift"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? "group-name-err" : undefined}
          />
          <button type="submit" disabled={savingName || name.trim() === saved} className={buttonClass("secondary", "shrink-0 disabled:opacity-50")}>
            {savingName ? "Saving" : name.trim() === saved && saved ? "Saved" : "Save"}
          </button>
        </div>
        {nameError ? (
          <p id="group-name-err" className="mt-1 text-xs text-[#e08a7f]">
            {nameError}
          </p>
        ) : null}
      </form>
      <div className="mt-5">
        {lobby.status === "started" ? (
          <Link href={`/play/${caseId}`} className={buttonClass("primary", "w-full justify-center")}>
            Return to the investigation
          </Link>
        ) : (
          <form action={startParty}>
            <SubmitButton pending="Starting" className="w-full justify-center">
              Start investigation
            </SubmitButton>
          </form>
        )}
      </div>
      {lobby.status === "started" ? <p className="mt-2 text-xs text-smoke">Under way. Latecomers can still scan to join.</p> : null}
    </div>
  );
}

export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="mt-1 text-xs text-smoke underline-offset-4 hover:text-paper hover:underline"
      onClick={async () => {
        await navigator.clipboard?.writeText(link).catch(() => undefined);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Link copied" : "Copy the join link instead"}
    </button>
  );
}
