import { motion } from 'framer-motion';

interface IconProps {
  className?: string;
}

/** Custom SVG: B2B quote clipboard / commercial sheet */
export function QuoteDocSvg({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M9 4.5h6a1.5 1.5 0 0 1 1.5 1.5v1h-9V6A1.5 1.5 0 0 1 9 4.5Z" />
      <path d="M7.5 6H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1.5" />
      <path d="M8.5 12h7" />
      <path d="M8.5 15.75h4.5" />
      <circle cx="15.5" cy="15.75" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Custom SVG: Open technical catalog brochure */
export function CatalogBookSvg({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3.5 5.5h5.5a3 3 0 0 1 3 3V19.5a2.25 2.25 0 0 0-2.25-2.25H3.5V5.5Z" />
      <path d="M20.5 5.5H15a3 3 0 0 0-3 3V19.5a2.25 2.25 0 0 1 2.25-2.25h6.25V5.5Z" />
      <path d="M6.5 9.5h2.5" />
      <path d="M15 9.5h2.5" />
      <path d="M15 12.75h2.5" />
    </svg>
  );
}

/** Custom SVG: Stacked product lines / industrial catalog grid */
export function LayersGridSvg({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3.5" y="4" width="7" height="7" rx="1.25" />
      <rect x="13.5" y="4" width="7" height="7" rx="1.25" />
      <rect x="3.5" y="13.5" width="7" height="6.5" rx="1.25" />
      <path d="M13.5 15.25h7" />
      <path d="M13.5 18.75h4.5" />
    </svg>
  );
}

/** Custom SVG: Authentic WhatsApp chat bubble with handset */
export function WhatsAppBubbleSvg({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3.25a8.5 8.5 0 0 0-7.43 12.63L3.5 20.5l4.78-1.05A8.5 8.5 0 1 0 12 3.25Z" />
      <path d="M9.4 9.1c.2-.45.55-.5.8-.5.2 0 .42.02.6.42.22.5.7 1.65.76 1.78.06.12.1.28 0 .45-.1.18-.2.28-.36.44-.15.16-.3.28-.14.56.17.28.75 1.24 1.62 2 .95.84 1.75 1.12 2.04 1.24.28.12.44.1.6-.08.17-.18.7-.8.9-1.08.18-.28.38-.23.62-.14.25.09 1.6.76 1.88.9.28.14.46.2.52.32.06.12.06.7-.18 1.38-.24.68-1.4 1.3-1.94 1.38-.52.08-1.18.12-1.9-.12-.45-.14-1.02-.34-1.76-.66-3.1-1.34-5.12-4.46-5.28-4.68-.15-.22-1.26-1.68-1.26-3.2 0-1.52.8-2.27 1.08-2.58Z" />
    </svg>
  );
}

/** Custom SVG: Cartographic location pin / delivery route */
export function MapPinRouteSvg({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 20.5s6.5-5.35 6.5-10.25a6.5 6.5 0 1 0-13 0C5.5 15.15 12 20.5 12 20.5Z" />
      <circle cx="12" cy="10.25" r="2.35" />
    </svg>
  );
}

/** Custom SVG: Factory / official website globe */
export function FactoryGlobeSvg({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4" />
      <path d="M12 3.5c2.4 2.3 3.7 5.2 3.7 8.5s-1.3 6.2-3.7 8.5c-2.4-2.3-3.7-5.2-3.7-8.5s1.3-6.2 3.7-8.5Z" />
    </svg>
  );
}

/** Custom SVG: Product inspection magnifier lens */
export function MagnifierSvg({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="10.75" cy="10.75" r="6.5" />
      <path d="M10.75 8v5.5" />
      <path d="M8 10.75h5.5" />
      <path d="m15.6 15.6 4.4 4.4" />
    </svg>
  );
}

/** Custom SVG: Duplicate / copy quote summary sheet */
export function CopySheetSvg({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="8.5" y="8.5" width="11" height="12" rx="1.5" />
      <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v9.5A1.5 1.5 0 0 0 6 17h2.5" />
      <path d="M11.5 13h5" />
      <path d="M11.5 16.25h3.5" />
    </svg>
  );
}

/** Custom SVG: Animated checkmark stroke (Emil Kowalski tactile feedback) */
export function CheckDrawSvg({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <motion.path
        d="M4.5 10.5 8.3 14.2 15.8 6.5"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

/** Custom SVG: Reset / clear form loop */
export function ResetSvg({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4.5 11.5a7.5 7.5 0 1 1 2.2 5.3" />
      <path d="M4.5 6.5v5h5" />
    </svg>
  );
}

/** Custom SVG: Minimal geometric dropdown disclosure mark */
export function DisclosureSvg({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5.5 7.75 10 12.25l4.5-4.5" />
    </svg>
  );
}

/** Custom SVG: PDF sheet download emblem */
export function PdfBadgeSvg({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6.5 3.5h7.25L18.5 8.25V19a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M13.5 3.5v5h5" />
      <path d="M8.5 13h7" />
      <path d="M8.5 16.25h4.75" />
    </svg>
  );
}

/** Custom SVG: Back-to-top anchor emblem */
export function TopReturnSvg({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5.5 11.75 10 7.25l4.5 4.5" />
      <path d="M5.5 4.75h9" />
    </svg>
  );
}

/** Custom SVG: Shield / industrial B2B trust mark */
export function IndustryBadgeSvg({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3.5 20.5h17" />
      <path d="M5.5 20.5V10.5l5 3v-3l5 3V6.5h3v14" />
      <path d="M9 17.25h1.5" />
      <path d="M13.5 17.25H15" />
    </svg>
  );
}
