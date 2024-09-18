// app/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = (url) => {
            window.gtag('config', GA_TRACKING_ID, {
                page_path: url,
            });
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    return (
        <>
            {/* Google Analytics Script */}
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', '${GA_TRACKING_ID}', {
                      page_path: window.location.pathname,
                    });
                    `,
                }}
            />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
