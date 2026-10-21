import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import 'driver.js/dist/driver.css';
import { SolanaWalletProvider } from '@/components/onchain/SolanaWalletProvider';

export const metadata: Metadata = {
  icons: { icon: '/brand/logo-icon.png' },
  title: 'Rekt School - Master Solana DeFi by Doing It Live',
  description:
    'Interactive, non-custodial Solana DeFi Academy. Learn AMMs, liquidity provision, lending protocols, token minting, and wallet security - Tier 1 live on Solana Devnet, Tier 2 in zero-risk sandbox labs.',
};

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-screen bg-bg text-ink font-sans antialiased">
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
      </body>
    </html>
  );
}
