import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff8e8", borderRadius: 112 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="460" height="121" viewBox="0 0 720 190">
          <defs>
            <linearGradient id="mango" x1="30" y1="25" x2="175" y2="175" gradientUnits="userSpaceOnUse"><stop stopColor="#FFD34D"/><stop offset=".52" stopColor="#FFB51B"/><stop offset="1" stopColor="#F07824"/></linearGradient>
            <linearGradient id="leaf" x1="88" y1="8" x2="170" y2="53" gradientUnits="userSpaceOnUse"><stop stopColor="#8BC34A"/><stop offset=".5" stopColor="#00A651"/><stop offset="1" stopColor="#087C3E"/></linearGradient>
            <linearGradient id="go" x1="420" y1="45" x2="590" y2="120" gradientUnits="userSpaceOnUse"><stop stopColor="#FFC928"/><stop offset=".46" stopColor="#F58220"/><stop offset=".48" stopColor="#00B14F"/><stop offset="1" stopColor="#087C3E"/></linearGradient>
          </defs>
          <g transform="translate(12 5)">
            <path d="M91 61C66 65 42 92 25 121C8 151 9 173 28 181C51 192 103 176 141 150C178 124 183 88 158 68C140 54 113 54 91 61Z" fill="url(#mango)"/>
            <path d="M91 73C68 82 47 111 34 137C22 162 25 171 40 171C68 172 116 150 143 125C164 105 157 80 135 72C120 67 104 69 91 73Z" fill="#fff"/>
            <path d="M88 57C96 27 126 8 179 5C166 35 143 57 116 64C104 67 94 64 88 57Z" fill="url(#leaf)"/>
            <path d="M99 54C124 42 151 24 176 8" fill="none" stroke="#B8DF78" strokeWidth="2" strokeLinecap="round" opacity=".75"/>
          </g>
          <path d="M213 24V166" stroke="#6B4A32" strokeWidth="2" opacity=".65"/>
          <g fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing="-5">
            <text x="242" y="112" fontSize="88" fill="#24170F">Xoài</text>
            <text x="425" y="112" fontSize="88" fill="url(#go)">Go</text>
          </g>
          <g fill="#087C3E"><rect x="575" y="47" width="56" height="10" rx="5"/><rect x="575" y="69" width="43" height="10" rx="5"/><rect x="575" y="91" width="30" height="10" rx="5"/></g>
          <text x="244" y="151" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="500" letterSpacing=".2" fill="#49382B">Cùng nhau mua tốt hơn.</text>
        </svg>
      </div>
    ),
    { ...size }
  );
}
