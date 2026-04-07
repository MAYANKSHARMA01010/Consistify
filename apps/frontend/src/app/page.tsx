import type { Metadata } from "next";
import LandingPageClient from "./LandingPageClient";

export const metadata: Metadata = {
    title: "Consistify | Daily Consistency Tracker",
    description: "Build habits and consistency with streak intelligence, progress analytics, and weekly reports.",
    keywords: [
        "habit tracker",
        "consistency app",
        "streak tracking",
        "productivity",
        "daily goals",
    ],
    openGraph: {
        title: "Consistify | Daily Consistency Tracker",
        description: "Build habits and consistency with streak intelligence and weekly progress analytics.",
        type: "website",
    },
};

export default function Home() {
    return <LandingPageClient />;
}
