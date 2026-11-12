"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { at, clockText, type StoryRun } from "./story";

/** The story on screen: the clock, what's near you, a spot's card, the notebook, the Time Bag and the great bell. */
export function StoryOverlay({ run, touch, onLook }: { run: StoryRun; touch: boolean; onLook: () => void }) {
  useSyncExternalStore(run.subscribe, run.version, run.version);
  const [now, setNow] = useState(0);
  const { s, ui } = run;
  // Toasts and the reset flash fade on their own.
  useEffect(() => {
    const id = setInterval(() => setNow(performance.now()), 250);
    return () => clearInterval(id);
  }, []);
  const toast = ui.toast && ui.toast.until > now ? ui.toast.text : null;
  const flash = Math.max(0, 1 - (now - ui.flash) / 2500);
  const open = run.spot(ui.open);
  const near = run.spot(ui.near);
  const pic = (key?: string | null) => (key ? (run.d.pictures?.[key] ?? null) : null);
  const holdingChronometer = run.holding("CE029");
  const left = s.dead && s.deathAt != null ? Math.max(0, s.deathAt + run.d.countdown - s.t) : null;
  const modal = !!open || !!ui.panel;
  useEffect(() => {
    if (modal && document.pointerLockElement) document.exitPointerLock();
  }, [modal]);
  const close = () => run.setUi({ open: null, panel: null });
  const found = Object.entries(s.found).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <>
      {/* The clock and the loop. */}
      <div className="pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-[3px] bg-black/55 px-3 py-1 text-center font-mono text-sm text-paper">
        {clockText(s.t)} <span className="text-smoke">· Loop {s.loop}</span>
        {holdingChronometer && left != null ? <span className="ml-2 text-brass">{Math.floor(left / 60)}:{String(Math.floor(left % 60)).padStart(2, "0")} remain</span> : null}
      </div>
      <div className="absolute right-2 top-9 z-20 flex flex-col items-end gap-1">
        <button className="rounded-[2px] bg-black/55 px-2 py-1 text-xs text-brass" onClick={() => run.setUi({ panel: ui.panel === "notebook" ? null : "notebook", open: null })}>
          Notebook ({found.length})
        </button>
      </div>

      {/* What's in front of you. */}
      {near && !modal ? (
        <div className="absolute bottom-28 left-1/2 z-20 -translate-x-1/2">
          {touch ? (
            <button className="rounded-[3px] bg-brass px-4 py-2 text-sm font-semibold text-ink shadow" onClick={onLook}>
              Look: {near.title}
            </button>
          ) : (
            <div className="pointer-events-none rounded-[3px] bg-black/60 px-3 py-1.5 text-sm text-paper">
              <span className="text-brass">E</span> {near.title}
            </div>
          )}
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none absolute left-1/2 top-12 z-30 w-[min(92vw,34rem)] -translate-x-1/2 rounded-[3px] bg-black/75 px-4 py-2 text-center text-sm leading-snug text-paper">{toast}</div>
      ) : null}

      {flash > 0 ? <div className="pointer-events-none absolute inset-0 z-40 bg-white" style={{ opacity: flash }} /> : null}

      {modal ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-3" onClick={close}>
          <div className="max-h-[88vh] w-[min(94vw,30rem)] overflow-y-auto rounded-[4px] border border-brass/40 bg-[#14100c] p-4 text-paper shadow-xl" onClick={(e) => e.stopPropagation()}>
            {open ? <SpotCard run={run} id={open.id} pic={pic} /> : null}
            {ui.panel === "notebook" ? (
              <div>
                <h2 className="font-display text-lg text-brass">Notebook</h2>
                {found.length ? null : <p className="mt-2 text-sm text-smoke">Nothing yet. Look around: anything you can look at closely glows faintly.</p>}
                <ul className="mt-2 space-y-2">
                  {found.map(([id, f]) => {
                    const ev = run.evidence(id);
                    const kept = s.bag[id];
                    return (
                      <li key={id} className="flex gap-2 rounded-[3px] bg-black/30 p-2">
                        {pic(ev?.image) ? <img src={pic(ev?.image)!} alt="" className="h-14 w-14 shrink-0 rounded-[2px] object-cover" /> : null}
                        <div className="min-w-0 text-sm">
                          <div className="font-semibold">{ev?.title ?? id}</div>
                          <div className="text-xs text-smoke">
                            Found in loop {f.loop} at {clockText(f.at)}
                            {kept ? ` · Kept by the Time Bag (loop ${kept.loop})` : ""}
                          </div>
                          <div className="mt-0.5 text-xs leading-snug text-paper/85">{ev?.text}</div>
                          {run.holding(id) && ev?.bag && kept?.loop !== s.loop ? (
                            <button className="mt-1 rounded-[2px] bg-brass/90 px-2 py-0.5 text-xs font-semibold text-ink" onClick={() => run.say(run.keep(id))}>
                              Send to the Time Bag
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {s.log.length ? (
                  <details className="mt-3 text-xs text-smoke">
                    <summary className="cursor-pointer text-paper/80">What has happened</summary>
                    <ul className="mt-1 space-y-0.5">
                      {s.log.slice(-60).reverse().map((l, i) => (
                        <li key={i}>
                          Loop {l.loop}, {clockText(l.t)}: {l.text}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
                <button
                  className="mt-4 text-xs text-smoke underline"
                  onClick={() => {
                    if (window.confirm("Start the whole case again from loop 1? Everything found and kept is lost.")) {
                      run.restart();
                      window.location.reload();
                    }
                  }}
                >
                  Start the case again
                </button>
              </div>
            ) : null}
            {ui.panel === "bag" ? (
              <div>
                <h2 className="font-display text-lg text-brass">Santa&apos;s Time Bag</h2>
                <p className="mt-1 text-xs text-smoke">What it holds keeps through every reset. Send things to it from your notebook once you&apos;ve taken them.</p>
                <ul className="mt-2 space-y-2">
                  {Object.entries(s.bag).map(([id, k]) => {
                    const ev = run.evidence(id);
                    return (
                      <li key={id} className="flex gap-2 rounded-[3px] bg-black/30 p-2 text-sm">
                        {pic(ev?.image) ? <img src={pic(ev?.image)!} alt="" className="h-12 w-12 shrink-0 rounded-[2px] object-cover" /> : null}
                        <div>
                          <div className="font-semibold">{ev?.title ?? id}</div>
                          <div className="text-xs text-smoke">Collected: loop {k.loop}. Kept by the Time Bag.</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {Object.keys(s.bag).length ? null : <p className="mt-2 text-sm text-smoke">Empty.</p>}
              </div>
            ) : null}
            {ui.panel === "bell" ? <Bell run={run} /> : null}
            <button className="mt-4 w-full rounded-[3px] border border-paper/20 py-1.5 text-sm" onClick={close}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SpotCard({ run, id, pic }: { run: StoryRun; id: string; pic: (k?: string | null) => string | null }) {
  const sp = run.spot(id)!;
  const s = run.s;
  const img = pic(sp.image);
  const done = (a: NonNullable<typeof sp.acts>[number]) => (a.evidence ? !!s.found[a.evidence] && (!a.take || s.taken.includes(`spot:${sp.id}`)) : !!a.flag && s.flags.includes(a.flag));
  const waiting = s.pending.some((p) => p.spot === sp.id);
  return (
    <div>
      <h2 className="font-display text-lg text-brass">{sp.title}</h2>
      {img ? <img src={img} alt="" className="mt-2 max-h-56 w-full rounded-[3px] object-cover" /> : null}
      <p className="mt-2 text-sm leading-relaxed">{sp.text}</p>
      <div className="mt-3 flex flex-col gap-1.5">
        {sp.opens === "bag" ? (
          <button className="rounded-[3px] bg-brass px-3 py-1.5 text-sm font-semibold text-ink" onClick={() => run.setUi({ open: null, panel: "bag" })}>
            Open the Time Bag
          </button>
        ) : null}
        {sp.opens === "bell" ? (
          <button className="rounded-[3px] bg-brass px-3 py-1.5 text-sm font-semibold text-ink" onClick={() => run.setUi({ open: null, panel: "bell" })}>
            Ring the bell
          </button>
        ) : null}
        {(sp.acts ?? []).map((a) => {
          const d = done(a);
          return (
            <button
              key={a.label}
              disabled={d || (waiting && !!a.minutes)}
              className="rounded-[3px] bg-brass px-3 py-1.5 text-sm font-semibold text-ink disabled:bg-paper/15 disabled:text-paper/50"
              onClick={() => {
                const said = run.act(sp, a);
                if (said) run.say(said);
                // Taking it, or opening something, changes what's here: close the card.
                if (a.take || a.flag) run.setUi({ open: null });
              }}
            >
              {d ? `Done: ${a.label}` : a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Bell({ run }: { run: StoryRun }) {
  const now = run.s.t;
  const options: number[] = [];
  for (let t = Math.ceil((now + 1) / 15) * 15; t <= at("23:00") && options.length < 60; t += 15) options.push(t);
  const [to, setTo] = useState(options[0] ?? now);
  return (
    <div>
      <h2 className="font-display text-lg text-brass">The great bell</h2>
      <p className="mt-1 text-sm">Let the day run ahead to a time. It stops early at anything that matters.</p>
      <select className="field mt-3 w-full py-1.5 text-sm" value={to} onChange={(e) => setTo(Number(e.target.value))}>
        {options.map((t) => (
          <option key={t} value={t}>
            {clockText(t)}
          </option>
        ))}
      </select>
      <button
        className="mt-2 w-full rounded-[3px] bg-brass px-3 py-1.5 text-sm font-semibold text-ink"
        onClick={() => {
          run.ringTo(to);
          run.setUi({ panel: null });
          run.say(`The bell rings. It is ${clockText(run.s.t)}.`);
        }}
      >
        Ring
      </button>
    </div>
  );
}
