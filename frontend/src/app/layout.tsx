// app/layout.tsx
import "./styles/globals.css"; // your global CSS
import "bootstrap-icons/font/bootstrap-icons.css";



export const metadata = {
  title: "My App",
  description: "Next.js LMS App",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body>{children}</body>
    </html>
  );
}
