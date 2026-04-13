/**
 * Inline SVG icons based on Lucide (https://lucide.dev) — ISC License.
 * Using inline SVGs avoids adding lucide-react as a runtime dependency.
 */

interface IconProps {
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}

const defaults = { size: 14, color: "currentColor" } as const;

const Svg = ({
  size = defaults.size,
  color = defaults.color,
  style,
  children,
}: IconProps & { children: React.ReactNode }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    style={style}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

export const PlayIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
  </Svg>
);

export const PauseIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect height={18} rx={1} width={5} x={14} y={3} />
    <rect height={18} rx={1} width={5} x={5} y={3} />
  </Svg>
);

export const XIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);

export const CheckIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const PanelLeftCloseIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect height={18} rx={2} width={18} x={3} y={3} />
    <path d="M9 3v18" />
    <path d="m16 15-3-3 3-3" />
  </Svg>
);

export const PanelLeftOpenIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect height={18} rx={2} width={18} x={3} y={3} />
    <path d="M9 3v18" />
    <path d="m14 9 3 3-3 3" />
  </Svg>
);

export const Trash2Icon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Svg>
);
