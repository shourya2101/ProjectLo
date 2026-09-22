import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ExtensionErrorCatcher } from "@/components/common/ExtensionErrorCatcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProjectLo - College Marketplace",
  description: "Buy, sell, and rent college projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  if (typeof window === 'undefined') return;

  function isExtensionRelated(target) {
    if (!target) return false;
    try {
      var str = '';
      if (typeof target === 'string') {
        str = target;
      } else if (typeof target === 'object') {
        str = (target.message || '') + ' ' + (target.stack || '') + ' ' + (target.filename || '') + ' ' + (target.reason?.message || '') + ' ' + (target.reason?.stack || '');
      }
      return (
        str.indexOf('chrome-extension://') !== -1 ||
        str.indexOf('moz-extension://') !== -1 ||
        str.indexOf('safari-extension://') !== -1 ||
        str.indexOf('M_ID') !== -1 ||
        str.indexOf('bis_skin_checked') !== -1 ||
        str.indexOf('ResizeObserver loop') !== -1
      );
    } catch (e) {
      return false;
    }
  }

  // Intercept error events immediately
  window.addEventListener('error', function(event) {
    if (isExtensionRelated(event) || isExtensionRelated(event.error) || isExtensionRelated(event.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  }, true);

  // Intercept unhandled promise rejections immediately
  window.addEventListener('unhandledrejection', function(event) {
    if (isExtensionRelated(event.reason)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  // Intercept console.error to filter out extension hydration mismatches
  var originalConsoleError = console.error;
  console.error = function() {
    for (var i = 0; i < arguments.length; i++) {
      if (isExtensionRelated(arguments[i])) {
        return;
      }
    }
    originalConsoleError.apply(console, arguments);
  };
})();
`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-[#090d16] text-slate-100 antialiased`} suppressHydrationWarning>
        <ExtensionErrorCatcher />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
