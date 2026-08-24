import type { NavItem } from "@/components/nav/BottomNav";

export const creatorNav: NavItem[] = [
  { key: "home", href: "/work/studio", label: "Home" },
  { key: "campaigns", href: "/work/studio?tab=campaigns", label: "Campaigns" },
  { key: "create", href: "/work/studio?tab=create", label: "Create", primary: true },
  { key: "kols", href: "/work/studio?tab=kols", label: "KOLs" },
  { key: "profile", href: "/work/studio?tab=profile", label: "Profile" },
];

export const businessNav: NavItem[] = [
  { key: "home", href: "/work/business", label: "Home" },
  { key: "campaigns", href: "/work/business?tab=campaigns", label: "Campaigns" },
  { key: "create", href: "/work/business?tab=create", label: "Create", primary: true },
  { key: "content", href: "/work/business?tab=content", label: "Content" },
  { key: "business", href: "/work/business?tab=business", label: "Business" },
];

export const managerNav: NavItem[] = [
  { key: "home", href: "/oversight/manager", label: "Home" },
  { key: "reviews", href: "/work/review", label: "Reviews", badge: 2 },
  { key: "creators", href: "/oversight/manager?tab=creators", label: "Creators" },
  { key: "campaigns", href: "/oversight/manager?tab=campaigns", label: "Campaigns" },
  { key: "profile", href: "/oversight/manager?tab=profile", label: "Profile" },
];
