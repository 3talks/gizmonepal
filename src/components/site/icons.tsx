import {
  Aperture,
  Backpack,
  BatteryCharging,
  Bike,
  Cable,
  Camera,
  Headphones,
  MemoryStick,
  Package,
  Plug,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Smartphone,
  Cable,
  BatteryCharging,
  Headphones,
  Camera,
  Bike,
  Backpack,
  Aperture,
  MemoryStick,
  Plug,
};

export const categoryIcon = (name?: string | null): LucideIcon =>
  (name && ICONS[name]) || Package;

export const ICON_NAMES = Object.keys(ICONS);
