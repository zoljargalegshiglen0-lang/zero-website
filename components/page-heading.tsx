import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon";

export function PageHeading({ icon, eyebrow, title, description, actions }: { icon: IconName; eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <section className="page-heading"><div className="heading-orb"><Icon name={icon} size={24} /></div><div className="heading-copy"><span className="page-eyebrow">WINGS NETWORK <i /> {eyebrow}</span><h1>{title}<em>·</em></h1><p>{description}</p></div>{actions && <div className="page-actions">{actions}</div>}</section>;
}

export function StatCard({ label, value, note, icon, tone = "violet" }: { label: string; value: string; note: string; icon: IconName; tone?: string }) {
  return <article className={`stat-card tone-${tone}`}><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div><i><Icon name={icon} size={19}/></i></article>;
}
