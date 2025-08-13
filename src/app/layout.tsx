// Root layout must always include html and body tags in Next.js App Router
// The locale-specific layout will handle the actual content structure

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
