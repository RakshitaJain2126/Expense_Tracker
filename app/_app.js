// pages/_app.js
import { useEffect } from 'react';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        // Optionally, you can add your custom Google Analytics event tracking code here.
    }, []);

    const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

    return (
        <>
            {/* Global Site Tag (gtag.js) - Google Analytics */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} // Use environment variable
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_ID}'); // Use environment variable
        `}
            </Script>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
