import type React from "react"
export function MooseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17 3a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2h10Z" />
      <path d="M12 8v8" />
      <path d="M8 10v4" />
      <path d="M16 10v4" />
      <path d="M8 14h8" />
    </svg>
  )
}
