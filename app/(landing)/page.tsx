import { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  metadataBase: new URL('https://launchify-ai.vercel.app'),
  title: 'Launchify AI',
  description: 'AI-powered startup pitch generator',
  keywords: ['AI', 'startup', 'pitch', 'generator'],
  openGraph: {
    title: 'Launchify AI',
    description: 'AI-powered startup pitch generator',
    type: 'website',
    url: 'https://launchify-ai.vercel.app',
    siteName: 'Launchify AI',
    images: [
      {
        url: 'https://launchify-ai.vercel.app/meta/opengraph.png',
        width: 1920,
        height: 1080,
        alt: 'Launchify AI',
      },
    ],
  },
  twitter: {
    title: 'Launchify AI',
    description: 'AI-powered startup pitch generator',
    card: 'summary_large_image',
    images: [
      {
        url: 'https://launchify-ai.vercel.app/meta/opengraph.png',
        width: 1920,
        height: 1080,
        alt: 'Launchify AI',
      },
    ],
  },
};

export default function LandingPage() {
  return <LandingClient />;
}
