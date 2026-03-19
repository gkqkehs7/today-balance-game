import type { Metadata } from 'next';
import { Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

const notoSerifKR = Noto_Serif_KR({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://today-bal.shop'),
  title: '오늘의 밸런스 게임',
  description: '오늘의 주제는 뭘까요?',
  keywords: ['밸런스 게임', '오늘의 밸런스 게임', '투표', '선택', '밸런스'],
  openGraph: {
    title: '오늘의 밸런스 게임',
    description: '오늘의 주제는 뭘까요?',
    url: 'https://today-bal.shop',
    siteName: '오늘의 밸런스 게임',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/og-image.png?v=2', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '오늘의 밸런스 게임',
    description: '오늘의 주제는 뭘까요?',
    images: ['/og-image.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

function getInitialTheme(): string {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  // daytime (6:30~18:30) + clear = light background
  const isDay = h >= 6.5 && h < 18.5;
  return isDay ? 'theme-light' : 'theme-dark';
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = getInitialTheme();

  return (
    <html lang="ko">
      <body
        className={`${notoSansKR.variable} ${notoSerifKR.variable} weather-clear ${initialTheme}`}
      >
        {children}
      </body>
    </html>
  );
}
