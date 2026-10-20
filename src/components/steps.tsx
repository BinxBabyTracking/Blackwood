export const STEPS = [
  {
    title: "Join the Agency",
    body: "Create your detective profile and receive access to the agency's case archive.",
  },
  {
    title: "Accept an Assignment",
    body: "Review available investigations and choose the case you want to pursue.",
  },
  {
    title: "Uncover the Truth",
    body: "Examine evidence, question suspects, connect clues, and submit your findings.",
  },
];

/** The three-step path from recruit to closed case. A real sequence, so it is numbered. */
export function Steps() {
  return (
    <ol className="grid gap-px overflow-hidden rounded-[var(--radius-file)] border border-rule bg-rule md:grid-cols-3">
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative bg-ink-2 p-7 sm:p-8">
          <span className="font-display text-6xl leading-none text-brass/80">{i + 1}</span>
          <h3 className="mt-6 font-serif text-xl text-paper">{s.title}</h3>
          <p className="mt-2 text-smoke">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
