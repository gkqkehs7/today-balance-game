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
  title: '오늘의 밸런스 게임',
  description: '지금 사람들은 어느 쪽일까요?',
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
