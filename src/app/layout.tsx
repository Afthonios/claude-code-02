// The root layout is now minimal and delegates to locale-based layouts
// This allows next-intl middleware to handle locale routing properly

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
