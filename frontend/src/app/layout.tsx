import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Poppins } from 'next/font/google';
import '../styles/bootstrap.min.css';
import '../styles/common.css';
import '../styles/main.css';
import '../styles/responsive.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Appify Community',
  description: 'Share moments with your community',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();
  return <html lang="en" data-scroll-behavior="smooth"><body suppressHydrationWarning className={poppins.className}>{children}</body></html>;
}
