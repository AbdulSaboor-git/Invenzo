import './globals.css';
import ReduxProvider from './reduxProvider';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Invenzo - Inventory Management',
  description: 'Shop inventory management system',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

const themeInitScript = `
  try {
    var theme = localStorage.getItem('theme') || 'light';
    var scheme = localStorage.getItem('colorScheme') || 'green';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('color-scheme', scheme);
  } catch (e) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preload" href="/invenzo_logo.png" as="image" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <ReduxProvider>
          <Toaster richColors position="top-right" />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
