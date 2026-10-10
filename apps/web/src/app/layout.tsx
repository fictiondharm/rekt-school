import type { Metadata } from 'next';
import './globals.css';
import 'driver.js/dist/driver.css';

export const metadata: Metadata = {
  icons: { icon: '/brand/logo-icon.png' },
  title: 'Rekt School - Master Solana DeFi by Doing It Live',
  description:
    'Interactive, non-custodial Solana DeFi Academy. Learn AMMs, liquidity provision, lending protocols, token minting, and wallet security on Solana Devnet with zero real capital at risk.',
};

import { SolanaWalletProvider } from '@/components/onchain/SolanaWalletProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg text-ink font-sans antialiased">
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
      </body>
    </html>
  );
}

