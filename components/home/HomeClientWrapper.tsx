import type { ReactNode } from 'react';
import HomeHeroGenerator from './HomeHeroGenerator';

interface HomeClientWrapperProps {
    staticContent: ReactNode;
    user: any;
    heroHeader?: ReactNode;
}

export default function HomeClientWrapper({ staticContent, user, heroHeader }: HomeClientWrapperProps) {
    return (
        <div className="min-h-screen">
            {/* Hero + AI Generator */}
            <HomeHeroGenerator user={user} heroHeader={heroHeader} />

            {/* SEO Static Content - always visible below the generator */}
            <div className="bg-background">
                {staticContent}
            </div>
        </div>
    );
}
