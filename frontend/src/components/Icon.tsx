import type { ReactNode } from "react";

const GLYPHS = {
  buraco: (
    <><path d="M2.5 19.5h19" /><ellipse cx="12" cy="14.5" rx="6.5" ry="2.5" /><path d="M7.5 8.5 9 11M16.5 8.5 15 11M12 5.5V9" /></>
  ),
  iluminacao: (
    <><path d="M6 21h6M9 21V7a3 3 0 0 1 3-3h2" /><path d="M13 4h5l2 3.5h-9Z" /><path d="M15.5 10.5v1.5M12.5 11.5l-.8 1.2M18.5 11.5l.8 1.2" /></>
  ),
  lixo: (
    <><path d="M4.5 7h15" /><path d="M9.5 7V4.5h5V7" /><path d="M6 7l1.2 13h9.6L18 7" /><path d="M10 11v5.5M14 11v5.5" /></>
  ),
  calcada: (
    <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 12h18M12 4v8M8 12v8" /><path d="m13.5 13.5 2 2-1.5 2 2 2.5" /></>
  ),
  arvore: (
    <><path d="M12 21v-6.5" /><path d="M12 14.5c-4.2 0-7-2.2-7-5.3 0-2.2 1.6-3.8 3.7-4.1C9.4 3.3 10.8 2.5 12.4 2.5c2.2 0 3.8 1.5 4.1 3.4 1.9.5 2.9 2 2.9 3.6 0 3-3.1 5-7.4 5Z" /><path d="m12 17.5 3-2M8 21h8" /></>
  ),
  alagamento: (
    <><path d="M4 10.5 12 4l8 6.5" /><path d="M6.5 9v4M17.5 9v4" /><path d="M2.5 16.5c1.6 0 1.6-1.2 3.2-1.2s1.6 1.2 3.2 1.2 1.6-1.2 3.1-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.1 1.2" /><path d="M2.5 20.5c1.6 0 1.6-1.2 3.2-1.2s1.6 1.2 3.2 1.2 1.6-1.2 3.1-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.1 1.2" /></>
  ),
  sinalizacao: (
    <><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" /><path d="M12 8v4.5M12 15.8h.01" /></>
  ),
  outros: (
    <><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><path d="M17.25 14v6.5M14 17.25h6.5" /></>
  ),
  aberta: (
    <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2.5" fill="currentColor" /></>
  ),
  analise: (
    <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.8-4.8M8 10.5h5" /></>
  ),
  andamento: (
    <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor" /></>
  ),
  resolvida: (
    <><circle cx="12" cy="12" r="8.5" /><path d="m8 12.3 2.7 2.7L16 9.5" /></>
  ),
  cancelada: (
    <><circle cx="12" cy="12" r="8.5" /><path d="M6 18 18 6" /></>
  ),
  prBaixa: (
    <><path d="M5 19v-3" /><path d="M10 19v-6" opacity=".3" /><path d="M15 19v-9" opacity=".3" /><path d="M20 19V7" opacity=".3" /></>
  ),
  prMedia: (
    <><path d="M5 19v-3" /><path d="M10 19v-6" /><path d="M15 19v-9" opacity=".3" /><path d="M20 19V7" opacity=".3" /></>
  ),
  prAlta: (
    <><path d="M5 19v-3" /><path d="M10 19v-6" /><path d="M15 19v-9" /><path d="M20 19V7" opacity=".3" /></>
  ),
  prCritica: (
    <><path d="M5 19v-3" /><path d="M10 19v-6" /><path d="M15 19v-9" /><path d="M20 19V7" /></>
  ),
  search: (
    <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></>
  ),
  plus: (
    <><path d="M12 5v14M5 12h14" /></>
  ),
  apoio: (
    <><path d="M7 10.5V20.5H4.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" /><path d="M7 10.5 10.8 3.5a2.4 2.4 0 0 1 2.7 2.4v3.6h5.1a2 2 0 0 1 2 2.3l-1.2 6.9a2 2 0 0 1-2 1.8H7" /></>
  ),
  pin: (
    <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>
  ),
  clock: (
    <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>
  ),
  copy: (
    <><rect x="9" y="9" width="11.5" height="11.5" rx="2" /><path d="M15 9V5.5a2 2 0 0 0-2-2H5.5a2 2 0 0 0-2 2V13a2 2 0 0 0 2 2H9" /></>
  ),
  check: (
    <><path d="m5 12.5 4.5 4.5L19 7.5" /></>
  ),
  x: (
    <><path d="M6 6l12 12M18 6 6 18" /></>
  ),
  alert: (
    <><path d="M10.3 4.2 2.7 17.5A2 2 0 0 0 4.4 20.5h15.2a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9.5v4M12 16.8h.01" /></>
  ),
  info: (
    <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8h.01" /></>
  ),
  lock: (
    <><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>
  ),
  key: (
    <><circle cx="8" cy="15.5" r="4.5" /><path d="m11.2 12.3 9-9M17 6.5l3 3M14.5 9l2 2" /></>
  ),
  shield: (
    <><path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6Z" /><path d="m9 12 2 2 4-4" /></>
  ),
  anonimo: (
    <><circle cx="10" cy="8" r="4" /><path d="M3 20.5c0-3.6 3.1-6.5 7-6.5 1.1 0 2.2.2 3.1.7" /><path d="m16 16 5 5M21 16l-5 5" /></>
  ),
  sparkle: (
    <><path d="M11 3c.7 4.6 2.9 6.8 7.5 7.5-4.6.7-6.8 2.9-7.5 7.5-.7-4.6-2.9-6.8-7.5-7.5C8.1 9.8 10.3 7.6 11 3Z" /><path d="M19 15.5v5M16.5 18h5" /></>
  ),
  filter: (
    <><path d="M4 6.5h16M7 12h10M10 17.5h4" /></>
  ),
  menu: (
    <><path d="M4 7h16M4 12h16M4 17h16" /></>
  ),
  chevronRight: (
    <><path d="m9 6 6 6-6 6" /></>
  ),
  chevronDown: (
    <><path d="m6 9 6 6 6-6" /></>
  ),
  arrowLeft: (
    <><path d="M19 12H5M11 6l-6 6 6 6" /></>
  ),
  arrowRight: (
    <><path d="M5 12h14M13 6l6 6-6 6" /></>
  ),
  refresh: (
    <><path d="M20 11A8 8 0 0 0 5.4 6.6L4 8" /><path d="M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.6 4.4L20 16" /><path d="M20 20v-4h-4" /></>
  ),
  wifiOff: (
    <><path d="M3 3l18 18" /><path d="M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.8M16.8 10.8A10 10 0 0 1 19 13M2 8.8a15 15 0 0 1 4-2.6M10.6 5.1A15 15 0 0 1 22 8.8" /><path d="M12 20h.01" /></>
  ),
  inbox: (
    <><path d="M3 13h5l1.5 3h5l1.5-3h5" /><path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6Z" /></>
  ),
  edit: (
    <><path d="M4 20h4L19 9l-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></>
  ),
  trash: (
    <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>
  ),
  list: (
    <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></>
  ),
} satisfies Record<string, ReactNode>;

const FIXED_STROKE = new Set<string>(["prBaixa", "prMedia", "prAlta", "prCritica"]);

export type IconName = keyof typeof GLYPHS;

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  label?: string;
};

export function Icon({ name, size = 24, strokeWidth = 1.75, label }: IconProps) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={FIXED_STROKE.has(name) ? 2.5 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "none" }}
      {...a11y}
    >
      {GLYPHS[name]}
    </svg>
  );
}
