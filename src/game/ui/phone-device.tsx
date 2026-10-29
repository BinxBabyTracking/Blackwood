"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ActionResponse, ClientView, GameAction } from "../engine/types";

/*
 * The investigator's smartphone, for cases with a mobile phone: a home screen
 * with Phone, Messages, Mail, Photos and Maps. Calls ring wherever the
 * investigator is (answered here or from the banner), people can be called or
 * texted, lab reports arrive in Mail, scene photographs collect in Photos, and
 * Maps travels. A battery, in cases that have one, runs down with calls and
 * texts and charges at the office and in the car; incoming calls and texts
 * always get through, so it never blocks the story.
 *
 * What counts as read (messages, mail) is remembered per viewer in the browser.
 */

type Dispatch = (a: GameAction) => Promise<ActionResponse | null>;
type App = "home" | "phone" | "messages" | "thread" | "mail" | "photos";

const SEEN_KEY = (caseId: string) => `bw.phoneSeen.${caseId}`;
type Seen = { threads: Record<string, number>; mail: string[] };

function readSeen(caseId: string): Seen {
  try {
    const v = JSON.parse(localStorage.getItem(SEEN_KEY(caseId)) ?? "null") as Seen | null;
    if (v && typeof v === "object") return { threads: v.threads ?? {}, mail: Array.isArray(v.mail) ? v.mail : [] };
  } catch {
    /* storage unavailable */
  }
  return { threads: {}, mail: [] };
}
function writeSeen(caseId: string, s: Seen) {
  try {
    localStorage.setItem(SEEN_KEY(caseId), JSON.stringify(s));
  } catch {
    /* storage unavailable: unread marks last until the page reloads */
  }
}

/** Unread counts for the phone's badges: texts not yet read, mail not yet opened, a call waiting. */
export function phoneBadges(view: ClientView, caseId: string, deferred: string | null) {
  const seen = typeof window === "undefined" ? { threads: {}, mail: [] } : readSeen(caseId);
  const texts = view.phone.threads.reduce((n, t) => n + Math.max(0, t.lines.filter((l) => !l.mine).length - (seen.threads[t.characterId] ?? 0)), 0);
  const mail = view.deliveries.filter((d) => !seen.mail.includes(d.id)).length;
  const missed = view.phone.ringing && deferred === view.phone.ringing.id ? 1 : 0;
  return { texts, mail, missed, total: texts + mail + missed };
}

export function PhoneDevice({
  caseId,
  view,
  dispatch,
  pending,
  onClose,
  deferredCall,
  onDecline,
  onOpenEvidence,
  onOpenMap,
}: {
  caseId: string;
  view: ClientView;
  dispatch: Dispatch;
  pending: boolean;
  onClose: () => void;
  /** A call the investigator let ring: shown as missed, with its voicemail. */
  deferredCall: string | null;
  onDecline: (callId: string) => void;
  onOpenEvidence: (id: string) => void;
  onOpenMap: () => void;
}) {
  const p = view.phone;
  const closed = view.status === "closed";
  const [app, setApp] = useState<App>(p.ringing && deferredCall !== p.ringing.id ? "phone" : "home");
  const [thread, setThread] = useState<string | null>(null);
  const [seen, setSeen] = useState<Seen>({ threads: {}, mail: [] });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeen(readSeen(caseId));
  }, [caseId]);
  const mark = (next: Seen) => {
    setSeen(next);
    writeSeen(caseId, next);
  };

  const battery = p.battery;
  const dead = battery !== null && battery <= 0;
  const missed = p.ringing && deferredCall === p.ringing.id ? p.ringing : null;
  const incoming = p.ringing && !missed ? p.ringing : null;
  const unreadTexts = p.threads.reduce((n, t) => n + Math.max(0, t.lines.filter((l) => !l.mine).length - (seen.threads[t.characterId] ?? 0)), 0);
  const unreadMail = view.deliveries.filter((d) => !seen.mail.includes(d.id)).length;
  const photos = view.evidence.filter((e) => e.photo);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (app === "thread") setApp("messages");
      else if (app !== "home") setApp("home");
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [app, onClose]);

  const openThread = (id: string) => {
    const t = p.threads.find((x) => x.characterId === id);
    mark({ ...seen, threads: { ...seen.threads, [id]: t ? t.lines.filter((l) => !l.mine).length : 0 } });
    setThread(id);
    setApp("thread");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-[2px] game-fade sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label="Your phone">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full flex-col overflow-hidden bg-[#0b0d10] text-paper sm:h-[min(46rem,100%)] sm:w-[23rem] sm:rounded-[2.6rem] sm:border-[10px] sm:border-[#1b1e22] sm:shadow-[0_30px_80px_-10px_rgba(0,0,0,0.9)]"
      >
        <StatusBar clock={view.clock} battery={battery} />
        <div className="relative min-h-0 flex-1 overflow-y-auto">
          {app === "home" ? (
            <Home
              onOpen={(a) => (a === "maps" ? onOpenMap() : setApp(a))}
              badges={{ phone: incoming || missed ? 1 : 0, messages: unreadTexts, mail: unreadMail }}
              photos={photos.length}
              dead={dead}
            />
          ) : null}
          {app === "phone" ? (
            <PhoneApp
              view={view}
              incoming={incoming}
              missed={missed}
              dead={dead || closed}
              pending={pending}
              onAnswer={(id) => dispatch({ type: "answerCall", callId: id })}
              onDecline={onDecline}
              onCall={(id) => dispatch({ type: "talk", characterId: id })}
              onPlace={(id) => dispatch({ type: "placeCall", callId: id })}
              onMessage={openThread}
            />
          ) : null}
          {app === "messages" ? <MessagesApp view={view} seen={seen} onOpen={openThread} /> : null}
          {app === "thread" && thread ? <Thread view={view} id={thread} dispatch={dispatch} pending={pending} dead={dead || closed} onSeen={(n) => mark({ ...seen, threads: { ...seen.threads, [thread]: n } })} /> : null}
          {app === "mail" ? (
            <MailApp
              view={view}
              seen={seen.mail}
              pending={pending}
              onOpen={(id) => {
                mark({ ...seen, mail: [...new Set([...seen.mail, id])] });
                void dispatch({ type: "openDelivery", deliveryId: id });
              }}
            />
          ) : null}
          {app === "photos" ? <PhotosApp photos={photos} onOpen={onOpenEvidence} /> : null}
        </div>
        <NavBar
          title={{ home: "", phone: "Phone", messages: "Messages", thread: p.threads.find((t) => t.characterId === thread)?.name ?? "Messages", mail: "Mail", photos: "Photos" }[app]}
          onBack={app === "home" ? onClose : () => setApp(app === "thread" ? "messages" : "home")}
          backLabel={app === "home" ? "Put the phone away" : app === "thread" ? "Messages" : "Home"}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Frame
// ---------------------------------------------------------------------------

function StatusBar({ clock, battery }: { clock: string | null; battery: number | null }) {
  const low = battery !== null && battery <= 20;
  return (
    <div className="flex shrink-0 items-center justify-between px-6 pb-1 pt-3 font-mono text-[0.7rem] text-paper/85">
      <span>{clock ?? ""}</span>
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 18 12" className="h-3 w-4" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.5} y={9 - i * 3} width="3" height={3 + i * 3} rx="0.5" fill="currentColor" />
          ))}
        </svg>
        {battery !== null ? (
          <span className={`flex items-center gap-1 ${low ? "text-fault" : ""}`} aria-label={`Battery ${battery}%`}>
            {battery}%
            <svg viewBox="0 0 26 12" className="h-3 w-6" aria-hidden>
              <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" fill="none" stroke="currentColor" />
              <rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor" />
              <rect x="2" y="2" width={Math.max(0, (19 * battery) / 100)} height="8" rx="1.5" fill="currentColor" />
            </svg>
          </span>
        ) : null}
      </span>
    </div>
  );
}

function NavBar({ title, onBack, backLabel }: { title: string; onBack: () => void; backLabel: string }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-white/5 bg-[#0e1114] px-4 py-3">
      <button type="button" onClick={onBack} className="text-sm text-brass hover:text-paper">
        {backLabel === "Put the phone away" ? backLabel : `‹ ${backLabel}`}
      </button>
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-smoke">{title}</span>
      <span className="w-16" aria-hidden />
    </div>
  );
}

function Badge({ n }: { n: number }) {
  return n > 0 ? (
    <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-[#e0483e] px-1.5 text-center font-mono text-[0.65rem] font-bold leading-5 text-white">{n}</span>
  ) : null;
}

function AppIcon({ label, color, badge, onClick, children }: { label: string; color: string; badge?: number; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col items-center gap-1.5">
      <span className={`relative flex h-14 w-14 items-center justify-center rounded-[1.1rem] shadow-md transition-transform group-hover:-translate-y-0.5 ${color}`}>
        {children}
        <Badge n={badge ?? 0} />
      </span>
      <span className="text-[0.72rem] text-paper/90">{label}</span>
    </button>
  );
}

const I = (d: string) => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

function Home({ onOpen, badges, photos, dead }: { onOpen: (a: App | "maps") => void; badges: { phone: number; messages: number; mail: number }; photos: number; dead: boolean }) {
  return (
    <div className="flex min-h-full flex-col bg-[radial-gradient(ellipse_at_30%_10%,#2a3440_0%,#12161b_55%,#0b0d10_100%)] px-6 pt-8">
      {dead ? (
        <p className="mb-6 rounded-xl border border-fault/50 bg-fault/10 px-4 py-3 text-sm">
          Battery empty. Calls and texts still come in, but you can&apos;t call or text out until you charge it: at the office, or in the car on your next drive.
        </p>
      ) : null}
      <div className="grid grid-cols-4 gap-x-3 gap-y-6">
        <AppIcon label="Phone" color="bg-[#2f9e57]" badge={badges.phone} onClick={() => onOpen("phone")}>
          {I("M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2")}
        </AppIcon>
        <AppIcon label="Messages" color="bg-[#2f9e57]" badge={badges.messages} onClick={() => onOpen("messages")}>
          {I("M4 5h16v11H9l-5 4z")}
        </AppIcon>
        <AppIcon label="Mail" color="bg-[#2f6fd1]" badge={badges.mail} onClick={() => onOpen("mail")}>
          {I("M3 6h18v12H3zM3 6l9 7 9-7")}
        </AppIcon>
        <AppIcon label="Photos" color="bg-[#e9e4dc]" badge={0} onClick={() => onOpen("photos")}>
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
            {["#f2b233", "#e0483e", "#9b59b6", "#2f6fd1", "#2f9e57"].map((c, i) => (
              <ellipse key={c} cx="12" cy="7" rx="3" ry="5" fill={c} opacity="0.85" transform={`rotate(${i * 72} 12 12)`} />
            ))}
          </svg>
        </AppIcon>
        <AppIcon label="Maps" color="bg-[#d9d2c3]" onClick={() => onOpen("maps")}>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" stroke="#3a6b45" />
            <path d="M15 9a2.5 2.5 0 1 1 0 .1M15 12v4" stroke="#e0483e" />
          </svg>
        </AppIcon>
      </div>
      <p className="mt-auto pb-6 pt-10 text-center text-[0.7rem] text-paper/40">{photos ? `${photos} photo${photos === 1 ? "" : "s"} in Photos` : ""}</p>
    </div>
  );
}

function Avatar({ src, name, size = "h-11 w-11" }: { src?: string; name: string; size?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`${size} shrink-0 rounded-full object-cover object-[50%_25%]`} draggable={false} />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-sm`}>{name.slice(0, 1)}</span>
  );
}

// ---------------------------------------------------------------------------
// Apps
// ---------------------------------------------------------------------------

function PhoneApp({
  view,
  incoming,
  missed,
  dead,
  pending,
  onAnswer,
  onDecline,
  onCall,
  onPlace,
  onMessage,
}: {
  view: ClientView;
  incoming: { id: string; from: string } | null;
  missed: { id: string; from: string } | null;
  dead: boolean;
  pending: boolean;
  onAnswer: (id: string) => void;
  onDecline: (id: string) => void;
  onCall: (id: string) => void;
  onPlace: (id: string) => void;
  onMessage: (id: string) => void;
}) {
  const p = view.phone;
  const [tab, setTab] = useState<"recents" | "contacts">(incoming || missed ? "recents" : "contacts");
  const portrait = (name: string) => view.characters.find((c) => c.name === name)?.portrait;
  if (incoming) {
    return (
      <div className="flex min-h-full flex-col items-center justify-between bg-[linear-gradient(#1d2833,#0b0d10)] px-6 pb-10 pt-12 text-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/60">Incoming call</p>
          <div className="mx-auto mt-6 w-fit">
            <Avatar src={portrait(incoming.from)} name={incoming.from} size="h-28 w-28" />
          </div>
          <p className="mt-4 font-display text-3xl">{incoming.from}</p>
        </div>
        <div className="flex w-full justify-around">
          <RoundButton color="bg-[#e0483e]" label="Decline" onClick={() => onDecline(incoming.id)} rotate />
          <RoundButton color="bg-[#2f9e57]" label="Answer" onClick={() => onAnswer(incoming.id)} disabled={pending} />
        </div>
      </div>
    );
  }
  return (
    <div className="px-4 pb-6 pt-2">
      <div className="mx-auto mb-4 flex w-fit rounded-lg bg-white/5 p-0.5 text-sm">
        {(["recents", "contacts"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md px-4 py-1 ${tab === t ? "bg-white/15 text-paper" : "text-paper/60"}`}>
            {t === "recents" ? "Recents" : "Contacts"}
          </button>
        ))}
      </div>
      {tab === "recents" ? (
        <ul className="divide-y divide-white/5">
          {missed ? (
            <li className="flex items-center gap-3 py-3">
              <Avatar src={portrait(missed.from)} name={missed.from} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[#e0483e]">{missed.from}</p>
                <p className="text-xs text-smoke">Missed call · Voicemail</p>
              </div>
              <button type="button" disabled={pending} onClick={() => onAnswer(missed.id)} className="rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20 disabled:opacity-50">
                Play voicemail
              </button>
            </li>
          ) : null}
          {[...p.log].reverse().map((c, i) => (
            <li key={`${c.id}-${i}`} className="py-3 text-sm text-paper/85">
              {c.title}
            </li>
          ))}
          {!missed && !p.log.length ? <li className="py-6 text-center text-sm text-smoke">No recent calls.</li> : null}
        </ul>
      ) : (
        <div>
          {p.outgoing.length ? (
            <div className="mb-4">
              <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-smoke">Calls to make</p>
              <ul className="space-y-2">
                {p.outgoing.map((c) => (
                  <li key={c.id}>
                    <button type="button" disabled={pending} onClick={() => onPlace(c.id)} className="w-full rounded-xl bg-white/5 px-4 py-3 text-left text-sm hover:bg-white/10 disabled:opacity-50">
                      <span className="block text-xs text-smoke">{c.to}</span>
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <ul className="divide-y divide-white/5">
            {p.contacts.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <Avatar src={view.characters.find((x) => x.id === c.id)?.portrait} name={c.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate">{c.name}</p>
                  <p className="truncate text-xs text-smoke">{c.note || c.role}</p>
                </div>
                {p.threads.some((t) => t.characterId === c.id && t.canText) ? (
                  <IconButton label={`Message ${c.name}`} onClick={() => onMessage(c.id)} disabled={false}>
                    {I("M4 5h16v11H9l-5 4z")}
                  </IconButton>
                ) : null}
                <IconButton label={`Call ${c.name}`} onClick={() => onCall(c.id)} disabled={dead || pending} green>
                  {I("M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2")}
                </IconButton>
              </li>
            ))}
            {!p.contacts.length ? <li className="py-6 text-center text-sm text-smoke">No one to call yet.</li> : null}
          </ul>
          {dead ? <p className="mt-3 text-center text-xs text-fault">Battery empty: charge your phone to call out.</p> : null}
        </div>
      )}
    </div>
  );
}

function IconButton({ label, onClick, disabled, green, children }: { label: string; onClick: () => void; disabled: boolean; green?: boolean; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className={`flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-40 [&_svg]:h-5 [&_svg]:w-5 ${green ? "bg-[#2f9e57]" : "bg-white/10"}`}>
      {children}
    </button>
  );
}

function RoundButton({ color, label, onClick, disabled, rotate }: { color: string; label: string; onClick: () => void; disabled?: boolean; rotate?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex flex-col items-center gap-2 disabled:opacity-50">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full ${color} ${rotate ? "[&_svg]:rotate-[135deg]" : ""}`}>
        {I("M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2")}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function MessagesApp({ view, seen, onOpen }: { view: ClientView; seen: Seen; onOpen: (id: string) => void }) {
  const threads = view.phone.threads;
  return (
    <ul className="divide-y divide-white/5 px-4 pb-6 pt-2">
      {threads.map((t) => {
        const last = t.lines.at(-1);
        const unread = t.lines.filter((l) => !l.mine).length - (seen.threads[t.characterId] ?? 0);
        return (
          <li key={t.characterId}>
            <button type="button" onClick={() => onOpen(t.characterId)} className="flex w-full items-center gap-3 py-3 text-left">
              <Avatar src={t.portrait} name={t.name} />
              <div className="min-w-0 flex-1">
                <p className={`truncate ${unread > 0 ? "font-semibold" : ""}`}>{t.name}</p>
                <p className="truncate text-xs text-smoke">{last ? `${last.mine ? "You: " : ""}${last.text}` : "Start a conversation"}</p>
              </div>
              {unread > 0 ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#2f6fd1]" aria-label="Unread" /> : null}
            </button>
          </li>
        );
      })}
      {!threads.length ? <li className="py-10 text-center text-sm text-smoke">No messages. Anyone who gives you their number can be texted from here.</li> : null}
    </ul>
  );
}

function Thread({ view, id, dispatch, pending, dead, onSeen }: { view: ClientView; id: string; dispatch: Dispatch; pending: boolean; dead: boolean; onSeen: (n: number) => void }) {
  const t = view.phone.threads.find((x) => x.characterId === id);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const theirs = t ? t.lines.filter((l) => !l.mine).length : 0;
  useEffect(() => {
    onSeen(theirs);
    end.current?.scrollIntoView({ block: "end" });
    // Only when new lines arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theirs, t?.lines.length]);
  const lines = useMemo(() => t?.lines ?? [], [t]);
  if (!t) return <p className="p-6 text-sm text-smoke">That conversation is gone.</p>;
  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    const r = await dispatch({ type: "askFree", characterId: id, text, via: "text" });
    setSending(false);
    if (r) setDraft("");
  };
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-col items-center gap-1 border-b border-white/5 py-3">
        <Avatar src={t.portrait} name={t.name} size="h-12 w-12" />
        <p className="text-sm">{t.name}</p>
      </div>
      <div className="flex-1 space-y-2 px-3 py-4">
        {lines.map((l) => (
          <div key={l.n} className={`flex ${l.mine ? "justify-end" : "justify-start"}`}>
            <p className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[0.92rem] leading-snug ${l.mine ? "rounded-br-md bg-[#2f6fd1] text-white" : "rounded-bl-md bg-white/10"}`}>{l.text}</p>
          </div>
        ))}
        {sending ? (
          <div className="flex justify-start" aria-label={`${t.name} is typing`}>
            <span className="flex gap-1 rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-paper/70" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </span>
          </div>
        ) : null}
        <div ref={end} />
      </div>
      {t.canText ? (
        <form
          className="sticky bottom-0 flex items-center gap-2 border-t border-white/5 bg-[#0b0d10] px-3 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 300))}
            placeholder={dead ? "Battery empty" : `Text ${t.name.split(" ")[0]}`}
            disabled={dead || pending || sending}
            className="min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm text-paper placeholder:text-paper/40 focus:border-brass focus:outline-none"
            aria-label={`Message to ${t.name}`}
          />
          <button type="submit" disabled={dead || pending || sending || !draft.trim()} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2f6fd1] disabled:opacity-40" aria-label="Send">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="white" aria-hidden>
              <path d="M12 4l7 7h-5v9h-4v-9H5z" />
            </svg>
          </button>
        </form>
      ) : (
        <p className="border-t border-white/5 px-4 py-3 text-center text-xs text-smoke">You can&apos;t text {t.name} right now.</p>
      )}
    </div>
  );
}

function MailApp({ view, seen, pending, onOpen }: { view: ClientView; seen: string[]; pending: boolean; onOpen: (id: string) => void }) {
  const mail = [...view.deliveries].reverse();
  return (
    <ul className="divide-y divide-white/5 px-4 pb-6 pt-2">
      {mail.map((d) => {
        const unread = !seen.includes(d.id);
        return (
          <li key={d.id}>
            <button type="button" disabled={pending} onClick={() => onOpen(d.id)} className="flex w-full items-start gap-3 py-3 text-left disabled:opacity-60">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${unread ? "bg-[#2f6fd1]" : "bg-transparent"}`} aria-label={unread ? "Unread" : undefined} />
              <span className="min-w-0 flex-1">
                <span className={`block truncate ${unread ? "font-semibold" : ""}`}>{d.title}</span>
                <span className="block truncate text-xs text-smoke">Attachment</span>
              </span>
            </button>
          </li>
        );
      })}
      {!mail.length ? <li className="py-10 text-center text-sm text-smoke">No mail. Lab reports and documents sent to you arrive here.</li> : null}
    </ul>
  );
}

function PhotosApp({ photos, onOpen }: { photos: ClientView["evidence"]; onOpen: (id: string) => void }) {
  return photos.length ? (
    <div className="grid grid-cols-3 gap-0.5 p-0.5">
      {photos.map((ph) => (
        <button key={ph.id} type="button" onClick={() => onOpen(ph.id)} className="relative aspect-square overflow-hidden bg-white/5" aria-label={ph.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ph.image} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />
        </button>
      ))}
    </div>
  ) : (
    <p className="px-6 py-10 text-center text-sm text-smoke">No photos yet. Photograph anything you look at in a scene and it&apos;s kept here.</p>
  );
}
