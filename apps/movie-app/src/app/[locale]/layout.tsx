import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '@/app/global.css';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import { AuthProvider } from '@/components/AuthProvider';
import NextLoader from '@/components/NextLoader';
import NavBar from '@/components/NavBar';

export const metadata = {
  title: 'TMDB Movie App',
  description: 'TMDB Movie App',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="overflow-x-hidden">
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <AuthProvider>
              <div className="bg-background min-h-screen">
                <NextLoader />
                <NavBar />
                <main className="w-full overflow-x-hidden">{children}</main>
              </div>
            </AuthProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
