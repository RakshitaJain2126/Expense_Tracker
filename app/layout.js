import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Expense Tracker",
  description: "Track your daily, monthly, and yearly expenses easily with our responsive Expense Tracker application.",
  keywords: "expense tracker, budget, finance, money management, savings, personal finance, track expenses",
  openGraph: {
    title: "Expense Tracker - Manage Your Finances",
    description: "Take control of your finances with our easy-to-use Expense Tracker. Organize, categorize, and track your expenses efficiently.",
    url: "https://expensetracker-gamma-gilt.vercel.app/",
    type: "website",
  }
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag (gtag.js) */}
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
