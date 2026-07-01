import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
        >
            <line x1="4" y1="9" x2="20" y2="9" />
            <path d="M4 15 L11 15 L14 19" />
        </svg>
    );
}
