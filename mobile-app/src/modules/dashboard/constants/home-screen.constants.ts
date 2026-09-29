import { Dimensions } from "react-native";
import { Spacing } from "../../../shared/constants/theme";
import type { ServiceTile, ApplyBanner } from "../types/dashboard.types";

const { width } = Dimensions.get("window");
export const H_PADDING = Spacing.three;
export const CARD_WIDTH = width - H_PADDING * 2;

export const SERVICE_TILES: ServiceTile[] = [
  { id: "gst", label: "GST", icon: "document-text", tint: "#2563EB", tintBg: "#EAF1FE", route: "/service/gst" as any },
  { id: "itr", label: "ITR", icon: "reader", tint: "#0F766E", tintBg: "#E6F5F2", route: "/service/itr" as any },
  { id: "tds", label: "TDS", icon: "calculator", tint: "#6D28D9", tintBg: "#F1ECFE", route: "/service/tds-refund" as any },
  { id: "loans", label: "Loans", icon: "business", tint: "#EA580C", tintBg: "#FEF0E6", route: "/service/loans" as any },
  { id: "insurance", label: "Insurance", icon: "shield-checkmark", tint: "#DC2626", tintBg: "#FDEBEB", route: "/service/health-insurance" as any },
];

export const MORE_TILE: ServiceTile = {
  id: "more",
  label: "More Services",
  icon: "grid",
  tint: "#083B75",
  tintBg: "#E7EDF5",
  isMore: true,
};

export const HOME_TILES: ServiceTile[] = [
  SERVICE_TILES[0],
  SERVICE_TILES[1],
  SERVICE_TILES[3],
  { ...MORE_TILE, label: "More\nServices" },
];

export const BANNER_NAVY = "#083B75";
export const BANNER_NAVY_DEEP = "#052750";

export const APPLY_BANNERS: ApplyBanner[] = (
  [
    { key: "b-gst", id: "GST", title: "GST", desc: "Registration, filing & compliance", cta: "Apply Now", icon: "receipt" },
    { key: "b-itr", id: "ITR", title: "ITR & TDS", desc: "File returns, claim your refund", cta: "File Now", icon: "calculator" },
    { key: "b-loans", id: "LOANS", title: "LOANS", desc: "Explore our loan solutions", cta: "Explore", icon: "wallet" },
    { key: "b-ins", id: "INSURANCE", title: "INSURANCE", desc: "Health & life cover plans", cta: "Get Quote", icon: "shield-checkmark" },
    { key: "b-company", id: "BUSINESS", title: "COMPANY SETUP", desc: "Incorporation & registrations", cta: "Start Now", icon: "business" },
    { key: "b-acct", id: "BUSINESS", title: "ACCOUNTING", desc: "Bookkeeping & monthly reports", cta: "Know More", icon: "stats-chart" },
  ] as const
).map((banner, i) => ({
  ...banner,
  bg: i % 2 === 0 ? BANNER_NAVY : BANNER_NAVY_DEEP,
}));
