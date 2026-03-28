import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'JumTech RD — Soluciones Tecnológicas Integrales',
    template: '%s | JumTech RD',
  },
  description:
    'JumTech RD ofrece soluciones tecnológicas integrales en República Dominicana: cámaras de seguridad, cableado estructurado, mantenimiento de computadoras, desarrollo de software, gestión de redes y ciberseguridad.',
  keywords: [
    'tecnología dominicana',
    'soluciones tecnológicas',
    'cámaras de seguridad',
    'cableado estructurado',
    'mantenimiento computadoras',
    'desarrollo software',
    'gestión redes',
    'ciberseguridad',
    'República Dominicana',
    'Santo Domingo',
    'JumTech RD',
  ],
  authors: [{ name: 'JumTech RD', url: 'https://jumtechrd.com' }],
  creator: 'JumTech RD',
  publisher: 'JumTech RD',
  metadataBase: new URL('https://jumtechrd.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_DO',
    url: 'https://jumtechrd.com',
    siteName: 'JumTech RD',
    title: 'JumTech RD — Soluciones Tecnológicas Integrales',
    description:
      'Expertos en tecnología en República Dominicana. Cámaras, redes, mantenimiento, desarrollo de software y más.',
    images: [
      {
        url: '/images/jumtech-logo-oficial.png',
        width: 800,
        height: 600,
        alt: 'JumTech RD Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JumTech RD — Soluciones Tecnológicas Integrales',
    description:
      'Expertos en tecnología en República Dominicana. Cámaras, redes, mantenimiento, desarrollo de software y más.',
    images: ['/images/jumtech-logo-oficial.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}