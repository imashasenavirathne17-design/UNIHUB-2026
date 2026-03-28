import React from 'react';

/**
 * PageHero — Unified hero section matching the Dashboard's Teal/Coral gradient style.
 *
 * Props:
 *   title        - string (supports JSX for <span> highlights)
 *   subtitle     - string
 *   badge        - string (pill badge label)
 *   BadgeIcon    - lucide icon component
 *   DecorIcon    - large background decoration icon
 *   color        - 'teal' | 'coral'  (default: 'teal')
 *   actions      - ReactNode (buttons to render at the bottom)
 */
const PageHero = ({
    title,
    subtitle,
    badge,
    BadgeIcon,
    DecorIcon,
    color = 'teal',
    actions,
    children,
}) => {
    const bg = color === 'coral'
        ? 'bg-gradient-to-br from-unihub-coral to-[#de3047]'
        : 'bg-gradient-to-br from-unihub-teal to-[#0d857a]';

    return (
        <div className={`relative rounded-[32px] overflow-hidden shadow-2xl mt-2 ${bg}`}>
            {/* White glow blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                {DecorIcon && (
                    <DecorIcon className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                )}
            </div>

            <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                <div className="max-w-3xl space-y-6">
                    {badge && BadgeIcon && (
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white uppercase tracking-[0.2em] shadow-xl">
                            <BadgeIcon className="w-4 h-4 text-unihub-yellow" />
                            {badge}
                        </div>
                    )}

                    <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter font-display">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="text-white/80 font-medium text-base md:text-lg max-w-xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}

                    {actions && (
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            {actions}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
};

export default PageHero;
