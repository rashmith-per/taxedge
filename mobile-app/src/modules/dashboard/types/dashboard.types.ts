import type { Href } from "expo-router";
import type { IconName, ServiceCategoryId } from "../../../shared/types/domain";

export interface ServiceTile {
  id: string;
  label: string;
  icon: IconName;
  tint: string;
  tintBg: string;
  route?: Href;
  isMore?: boolean;
}

export interface Deadline {
  id: string;
  tag: string;
  tint: string;
  tintBg: string;
  title: string;
  date: string;
  urgent: boolean;
  route: Href;
}

export interface StatTile {
  id: string;
  label: string;
  value: string;
  tint: string;
  tintBg: string;
  icon: IconName;
  route: Href;
}

export interface ApplyBanner {
  key: string;
  id: ServiceCategoryId;
  title: string;
  desc: string;
  cta: string;
  icon: IconName;
  bg: string;
}

export interface DashboardServiceTile {
  id: string;
  label: string;
  image: any;
  route?: any;
  isMore?: boolean;
}
