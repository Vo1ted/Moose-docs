import type React from "react"

export function MooseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none" {...props}>
      {/* Antlers */}
      <path
        d="M120 90C150 120 170 150 190 180C210 150 230 120 260 90M240 90C270 120 290 150 310 180C330 150 350 120 380 90"
        stroke="#5C3317"
        strokeWidth="25"
        strokeLinecap="round"
      />

      {/* Face */}
      <path
        d="M250 400C180 400 150 300 150 250C150 200 200 180 250 180C300 180 350 200 350 250C350 300 320 400 250 400Z"
        fill="#8B4513"
      />

      {/* Neck/Body */}
      <path d="M180 400C180 450 200 500 250 500C300 500 320 450 320 400" fill="#000000" />

      {/* Eyes */}
      <circle cx="210" cy="250" r="10" fill="#000000" />
      <circle cx="290" cy="250" r="10" fill="#000000" />

      {/* Nose */}
      <ellipse cx="250" cy="320" rx="30" ry="20" fill="#000000" />

      {/* Small moose silhouette */}
      <path
        d="M250 450C240 450 235 445 230 440C225 445 220 450 210 450C210 460 220 470 230 470C240 470 250 460 250 450Z"
        fill="#000000"
        transform="translate(0, 20) scale(0.5)"
      />
    </svg>
  )
}
