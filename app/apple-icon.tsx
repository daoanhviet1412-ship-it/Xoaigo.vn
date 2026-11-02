import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff8e8" }}>
        <svg width="148" height="148" viewBox="0 0 200 200" fill="none">
          <defs>
            <linearGradient id="mango" x1="25" y1="20" x2="170" y2="185" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFD34D" /><stop offset=".52" stopColor="#FFB51B" /><stop offset="1" stopColor="#F07824" />
            </linearGradient>
            <linearGradient id="leaf" x1="88" y1="8" x2="170" y2="53" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8BC34A" /><stop offset=".5" stopColor="#00A651" /><stop offset="1" stopColor="#087C3E" />
            </linearGradient>
          </defs>
          <path d="M91 61C66 65 42 92 25 121C8 151 9 173 28 181C51 192 103 176 141 150C178 124 183 88 158 68C140 54 113 54 91 61Z" fill="url(#mango)" />
          <path d="M91 73C68 82 47 111 34 137C22 162 25 171 40 171C68 172 116 150 143 125C164 105 157 80 135 72C120 67 104 69 91 73Z" fill="#fff" />
          <path d="M88 57C96 27 126 8 179 5C166 35 143 57 116 64C104 67 94 64 88 57Z" fill="url(#leaf)" />
          <path d="M99 54C124 42 151 24 176 8" fill="none" stroke="#B8DF78" strokeWidth="2" strokeLinecap="round" opacity=".75" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
