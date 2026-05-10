export const metadata = {
  title: "TTZ Fitness — Transform Your Body, Transform Your Life",
  description:
    "TTZ is more than a gym. A transformation space focused on strength, confidence, discipline and lifestyle improvement. Designed by Rexora Media.",
  keywords: "TTZ fitness, gym, transformation, personal training, Archana, Rexora Media",
  openGraph: {
    title: "TTZ Fitness",
    description: "Discipline. Strength. Confidence.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@400;600;700;900&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#060606" }}>
        {children}
      </body>
    </html>
  );
}
