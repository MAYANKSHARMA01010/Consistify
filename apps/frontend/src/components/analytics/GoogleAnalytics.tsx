'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

export const trackEvent = (eventName: string, params: Record<string, unknown> = {}) => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
        return;
    }

    window.gtag('event', eventName, params);
};

export default function GoogleAnalytics() {
    if (!GA_MEASUREMENT_ID) {
        return null;
    }

    return (
        <>
            {/* Load the Google Analytics script asynchronously */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            {/* Initialize the dataLayer and gtag function */}
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                        gtag('config', '${GA_MEASUREMENT_ID}');
                `}
            </Script>
        </>
    );
}
