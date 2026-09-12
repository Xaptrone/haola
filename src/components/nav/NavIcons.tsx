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
  size = 22,
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
    <svg {...svgBase(size, active)}>
      {active ? (
        <path d="M12 3.4 3.2 10.6V20a1.4 1.4 0 0 0 1.4 1.4h5.1v-6.3h5.6v6.3h5.1A1.4 1.4 0 0 0 20.8 20v-9.4L12 3.4Z" />
      ) : (
        <path d="M4 10.7 12 4l8 6.7V20a1 1 0 0 1-1 1h-5.2v-6.4H9.2V21H5a1 1 0 0 1-1-1v-9.3Z" />
      )}
    </svg>
  );
}

function FlagIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg {...svgBase(size, active)}>
      {active ? (
        <path d="M6 3.2h.1 11.2l-2.2 4.2 2.2 4.2H6.1V21H4.4V3.2H6Z" />
      ) : (
        <path d="M5.2 21V4.4h11.4l-2 3.8 2 3.8H5.2" />
      )}
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
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}

function PeopleIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg {...svgBase(size, active)}>
      {active ? (
        <>
          <circle cx="9" cy="8" r="3.1" />
          <path d="M3.4 20.2c.5-3.6 2.7-5.4 5.6-5.4 2.9 0 5.1 1.8 5.6 5.4" />
          <circle cx="16.6" cy="8.6" r="2.4" />
          <path d="M15.2 14.6c2.2.3 3.8 1.8 4.4 5.6" />
        </>
      ) : (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M4 19.8c.5-3.2 2.4-5 5-5s4.5 1.8 5 5" />
          <circle cx="16.5" cy="8.6" r="2.4" />
          <path d="M15.4 14.4c2.2.3 3.7 1.7 4.2 5.4" />
        </>
      )}
    </svg>
  );
}

function PersonIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg {...svgBase(size, active)}>
      {active ? (
        <>
          <circle cx="12" cy="8" r="3.4" />
          <path d="M5.2 20.4c.7-3.8 3.2-5.8 6.8-5.8s6.1 2 6.8 5.8" />
        </>
      ) : (
        <>
          <circle cx="12" cy="8" r="3.1" />
          <path d="M6 19.8c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3" />
        </>
      )}
    </svg>
  );
}

function PlayIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg {...svgBase(size, active)}>
      {active ? (
        <>
          <rect x="3" y="5.4" width="18" height="13.2" rx="2.6" />
          <path className="fill-surface" stroke="none" d="M10.2 9.2v5.6l5-2.8-5-2.8Z" />
        </>
      ) : (
        <>
          <rect x="3.2" y="5.8" width="17.6" height="12.4" rx="2.4" />
          <path d="M10.2 9.4v5.2l4.6-2.6-4.6-2.6Z" />
        </>
      )}
    </svg>
  );
}

function StoreIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg {...svgBase(size, active)}>
      {active ? (
        <path d="M4 9.2 5.2 4.6h13.6L20 9.2v1.4A2.6 2.6 0 0 1 17.2 13c-.8 0-1.5-.3-2-.8-.5.5-1.2.8-2 .8s-1.5-.3-2-.8c-.5.5-1.2.8-2 .8A2.6 2.6 0 0 1 4 10.6V9.2Zm1.6 4.4v6.8h4.2v-5h4.4v5h4.2v-6.8c.6.3 1.3.4 2 .4.3 0 .6 0 .9-.1v8.1H4.1v-8.1c.3.1.6.1.9.1.7 0 1.4-.1 2-.4Z" />
      ) : (
        <>
          <path d="M4.2 9.4 5.4 4.8h13.2l1.2 4.6" />
          <path d="M4.2 9.4v1.3a2.4 2.4 0 0 0 4.8 0 2.4 2.4 0 0 0 4.8 0 2.4 2.4 0 0 0 4.8 0V9.4" />
          <path d="M6.2 13.6V20h11.6v-6.4" />
          <path d="M10.4 20v-4.2h3.2V20" />
        </>
      )}
    </svg>
  );
}

function InboxIcon({ active, size }: { active: boolean; size: number }) {
  return (
    <svg {...svgBase(size, active)}>
      {active ? (
        <path d="M3.4 7.2 12 12.6l8.6-5.4V6.4L12 3.4 3.4 6.4v.8Zm0 1.5V18a1.8 1.8 0 0 0 1.8 1.8h13.6A1.8 1.8 0 0 0 20.6 18V8.7l-5.1 3.2v.4c0 1.5-1.3 2.6-3.5 2.6s-3.5-1.1-3.5-2.6v-.4L3.4 8.7Z" />
      ) : (
        <>
          <path d="M4 7.2 12 12l8-4.8" />
          <path d="M4 7.2v9.4A1.6 1.6 0 0 0 5.6 18.2h12.8A1.6 1.6 0 0 0 20 16.6V7.2L12 3.8 4 7.2Z" />
          <path d="M8.4 13.6c.3 1.2 1.6 2 3.6 2s3.3-.8 3.6-2" />
        </>
      )}
    </svg>
  );
}

function svgBase(size: number, filled: boolean) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: filled ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: filled ? 0 : 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
}
