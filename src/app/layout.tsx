import './globals.css';

export const metadata = {
  title: 'Aero Cloud',
  description: 'Aero Cloud 3‑D scroll showcase',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
