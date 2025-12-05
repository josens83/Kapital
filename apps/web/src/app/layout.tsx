import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'Kapital - 복식부기 기반 개인 재무관리',
  description: '진정한 복식부기 회계를 일반인도 쉽게 사용할 수 있는 개인 재무관리 앱',
  keywords: ['재무관리', '가계부', '복식부기', '자산관리', '예산관리'],
  authors: [{ name: 'Kapital' }],
  openGraph: {
    title: 'Kapital - 복식부기 기반 개인 재무관리',
    description: '진정한 복식부기 회계를 일반인도 쉽게 사용할 수 있는 개인 재무관리 앱',
    url: 'https://kapital.app',
    siteName: 'Kapital',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
