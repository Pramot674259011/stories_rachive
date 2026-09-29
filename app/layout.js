import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import { loadWorks } from "@/lib/loadWorks";

export const metadata = {
  title: "StoriesRachive — I See Through the Wild",
  description: "Wildlife photography archive by Ethan Vale. Field notes from natural encounters, captured without intervention.",
};
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  const works = loadWorks();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" />
      </head>
      <body>
        <Providers works={works}>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
