import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Banknote,
  Bell,
  BookOpen,
  Box,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Cloud,
  CloudDownload,
  Cpu,
  FileCheck2,
  FilePlus2,
  Files,
  FileText,
  FolderOpen,
  GitBranch,
  Globe,
  Hospital,
  KeyRound,
  Layers,
  Leaf,
  Link2,
  LockKeyhole,
  MapPin,
  Menu,
  MessageSquare,
  Network,
  PlayCircle,
  Plug,
  PlusCircle,
  Quote,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ShieldUser,
  SquareCode,
  User,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type IconProps = Omit<ComponentProps<LucideIcon>, "ref"> & {
  icon: string;
};

const iconMap: Record<string, LucideIcon> = {
  "logos:aws": Cloud,
  "logos:azure-icon": Cloud,
  "logos:github-icon": GitBranch,
  "logos:google-cloud": Cloud,
  "logos:microsoft": Building2,
  "logos:slack-icon": MessageSquare,
  "solar:add-circle-linear": PlusCircle,
  "solar:alt-arrow-down-linear": ChevronDown,
  "solar:arrow-right-linear": ArrowRight,
  "solar:banknote-2-linear": Banknote,
  "solar:bell-linear": Bell,
  "solar:bolt-circle-linear": Zap,
  "solar:book-linear": BookOpen,
  "solar:box-linear": Box,
  "solar:calendar-check-linear": CalendarCheck,
  "solar:check-circle-linear": CheckCircle2,
  "solar:clipboard-check-linear": ClipboardCheck,
  "solar:close-circle-linear": XCircle,
  "solar:cloud-download-linear": CloudDownload,
  "solar:code-square-linear": SquareCode,
  "solar:cpu-bolt-linear": Cpu,
  "solar:cpu-linear": Cpu,
  "solar:document-add-linear": FilePlus2,
  "solar:document-check-linear": FileCheck2,
  "solar:document-text-linear": FileText,
  "solar:documents-linear": Files,
  "solar:folder-with-files-linear": FolderOpen,
  "solar:forbidden-circle-linear": XCircle,
  "solar:global-linear": Globe,
  "solar:hamburger-menu-linear": Menu,
  "solar:hospital-linear": Hospital,
  "solar:leaf-linear": Leaf,
  "solar:link-circle-linear": Link2,
  "solar:link-square-linear": Link2,
  "solar:lock-keyhole-minimalistic-linear": LockKeyhole,
  "solar:lock-password-linear": KeyRound,
  "solar:map-point-linear": MapPin,
  "solar:play-circle-linear": PlayCircle,
  "solar:plug-circle-linear": Plug,
  "solar:plug-linear": Plug,
  "solar:quote-left-linear": Quote,
  "solar:server-square-linear": Server,
  "solar:settings-linear": Settings,
  "solar:settings-minimalistic-linear": Settings,
  "solar:shield-check-linear": ShieldCheck,
  "solar:shield-keyhole-linear": Shield,
  "solar:shield-network-linear": Network,
  "solar:shield-up-linear": ShieldCheck,
  "solar:shield-user-linear": ShieldUser,
  "solar:shield-warning-linear": ShieldAlert,
  "solar:star-linear": ShieldCheck,
  "solar:user-rounded-linear": User,
  "solar:users-group-rounded-linear": Users,
  "solar:widget-5-linear": Layers,
};

export function Icon({
  icon,
  className,
  size = "1em",
  strokeWidth = 1.8,
  ...props
}: IconProps) {
  const IconComponent = iconMap[icon] ?? ShieldQuestion;

  return (
    <IconComponent
      aria-hidden="true"
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
