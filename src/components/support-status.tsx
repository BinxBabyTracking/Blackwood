import { Tag } from "@/components/ui";

export function StatusTag({ status, admin = false }: { status: "open" | "answered" | "closed"; admin?: boolean }) {
  if (status === "open") return <Tag tone={admin ? "caution" : "muted"}>{admin ? "Needs a reply" : "Waiting for us"}</Tag>;
  if (status === "answered") return <Tag tone="ok">Answered</Tag>;
  return <Tag>Closed</Tag>;
}
