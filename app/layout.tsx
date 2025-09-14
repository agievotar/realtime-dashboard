export const metadata = {
  title: 'Realtime Dashboard',
  description: 'Prototype dashboard with live chart and dark mode',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
