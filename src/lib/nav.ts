import type { NavItem } from "@/components/nav/BottomNav";

export const creatorNav: NavItem[] = [
  { key: "home", href: "/work/studio", label: "Home", icon: "home" },
  {
    key: "campaigns",
    href: "/work/studio?tab=campaigns",
    label: "Campaigns",
    icon: "campaigns",
  },
  {
    key: "create",
    href: "/work/studio?tab=create",
    label: "Create",
    icon: "create",
    primary: true,
  },
  { key: "kols", href: "/work/studio?tab=kols", label: "KOLs", icon: "kols" },
  { key: "profile", href: "/work/studio?tab=profile", label: "Profile", icon: "profile" },
];

export const businessNav: NavItem[] = [
  { key: "home", href: "/work/business", label: "Home", icon: "home" },
  {
    key: "campaigns",
    href: "/work/business?tab=campaigns",
    label: "Campaigns",
    icon: "campaigns",
  },
  {
    key: "create",
    href: "/work/business?tab=create",
    label: "Create",
    icon: "create",
    primary: true,
  },
  {
    key: "content",
    href: "/work/business?tab=content",
    label: "Content",
    icon: "content",
  },
  {
    key: "business",
    href: "/work/business?tab=business",
    label: "Business",
    icon: "business",
  },
];

export const managerNav: NavItem[] = [
  { key: "home", href: "/oversight/manager", label: "Home", icon: "home" },
  {
    key: "reviews",
    href: "/work/review",
    label: "Reviews",
    icon: "reviews",
    badge: 2,
  },
  {
    key: "creators",
    href: "/oversight/manager?tab=creators",
    label: "Creators",
    icon: "kols",
  },
  {
    key: "campaigns",
    href: "/oversight/manager?tab=campaigns",
    label: "Campaigns",
    icon: "campaigns",
  },
  {
    key: "profile",
    href: "/oversight/manager?tab=profile",
    label: "Profile",
    icon: "profile",
  },
];
