export type NavIconName =
  | "home"
  | "campaigns"
  | "create"
  | "kols"
  | "profile"
  | "content"
  | "business"
  | "reviews";

export function NavIcon({
  name,
  active = false,
  size = 24,
}: {
  name: NavIconName;
  active?: boolean;
  size?: number;
}) {
  switch (name) {
    case "home":
      return <HomeIcon active={active} size={size} />;
    case "campaigns":
      return <FlagIcon active={active} size={size} />;
    case "create":
      return <PlusIcon size={size} />;
    case "kols":
      return <PeopleIcon active={active} size={size} />;
    case "profile":
      return <PersonIcon active={active} size={size} />;
    case "content":
      return <PlayIcon active={active} size={size} />;
    case "business":
      return <StoreIcon active={active} size={size} />;
    case "reviews":
      return <InboxIcon active={active} size={size} />;
    default: {
      const _never: never = name;
      throw new Error(`Unhandled nav icon: ${_never}`);
    }
  }
}

function HomeIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <polygon
        points="12,2.8 22,11.2 22,21.2 2,21.2 2,11.2"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlagIcon({ active, size }: { active: boolean; size: number }) {
  if (active) {
    return (
      <svg {...box(size, true)}>
        <path d="M5 3h12.2l-2.1 4.2 2.1 4.2H5V21H3.2V3H5Z" />
      </svg>
    );
  }
  return (
    <svg {...box(size, false)}>
      <path d="M5 21V4.5h11.5l-1.8 3.7 1.8 3.7H5" />
    </svg>
  );
}

function PlusIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}

function PeopleIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg {...box(size, active)}>
      <circle cx="9" cy="8" r="3.1" />
      <path d="M3.6 20.2c.4-3.4 2.6-5.3 5.4-5.3 2.8 0 5 1.9 5.4 5.3H3.6Z" />
      <circle cx="16.7" cy="8.7" r="2.4" />
      <path d="M15.4 14.7c2.1.3 3.6 1.8 4.2 5.5H15.2Z" />
    </svg>
  );
}

function PersonIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg {...box(size, active)}>
      <circle cx="12" cy="8" r="3.3" />
      <path d="M5.4 20.4c.6-3.7 3.1-5.7 6.6-5.7s6.2 2 6.8 5.7H5.4Z" />
    </svg>
  );
}

function PlayIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg {...box(size, active)}>
      <rect x="3.2" y="5.8" width="17.6" height="12.4" rx="2.4" />
      {active ? (
        <path className="fill-surface" stroke="none" d="M10.4 9.3v5.4l4.8-2.7-4.8-2.7Z" />
      ) : (
        <path d="M10.4 9.4v5.2l4.6-2.6-4.6-2.6Z" />
      )}
    </svg>
  );
}

function StoreIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg {...box(size, active)}>
      <path d="M4.2 9.5 5.5 4.8h13l1.3 4.7" />
      <path d="M4.2 9.5v1.2a2.3 2.3 0 0 0 4.6 0 2.3 2.3 0 0 0 4.6 0 2.3 2.3 0 0 0 4.6 0V9.5" />
      <path d="M6.4 13.5V20h11.2v-6.5" />
      <path d="M10.5 20v-4h3v4" />
    </svg>
  );
}

function InboxIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg {...box(size, active)}>
      <path d="M4 7.4 12 12.2 20 7.4" />
      <path d="M4 7.4v9.2A1.6 1.6 0 0 0 5.6 18.2h12.8A1.6 1.6 0 0 0 20 16.6V7.4L12 3.8 4 7.4Z" />
      <path d="M8.6 13.8c.4 1.2 1.7 2 3.4 2s3-.8 3.4-2" />
    </svg>
  );
}

function box(size: number, filled: boolean) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: activeFill(filled),
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
}

function activeFill(filled: boolean) {
  return filled ? "currentColor" : "none";
}
