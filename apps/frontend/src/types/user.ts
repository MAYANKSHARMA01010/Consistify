export type User = {
    id: string;
    name: string;
    email: string;
    username: string;
    role: "USER" | "ADMIN";
    emailVerified: boolean;
    verificationBannerDismissed: boolean;
    xp?: number;
};
