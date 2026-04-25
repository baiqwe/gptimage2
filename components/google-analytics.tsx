import Script from 'next/script';
import { siteConfig } from '@/config/site';

export function GoogleAnalytics() {
    if (!siteConfig.gaId || siteConfig.gaId === 'G-PLACEHOLDER') {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaId}`}
                strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', '${siteConfig.gaId}');
                `}
            </Script>
        </>
    );
}
