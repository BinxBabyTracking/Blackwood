/** Investigator photo, or initials on a plain plate when no photo is set. */
export function Avatar({ name, url, size = 36 }: { name: string | null; url: string | null; size?: number }) {
  const initials =
    (name ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "?";
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-[2px] border border-rule object-cover grayscale-[35%]"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-[2px] border border-rule bg-card font-serif text-brass"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}
