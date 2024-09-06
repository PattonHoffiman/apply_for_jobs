'use client'

import { Roboto_Slab } from 'next/font/google';
import { createGlobalStyle } from 'styled-components';

import StyledComponentsRegistry from './registry';

const metadata = {
  title: 'Password Generator',
  description: 'Password Generator',
}

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  variable: "--font-roboto-slab",
  weight: ['300', '400', '500', '700'],
});

const GlobalStyles = createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;

    width: 100vw;
    height: 100vh;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: #eceff4;
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={`${robotoSlab.variable}`}>
        <StyledComponentsRegistry>
          <GlobalStyles />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
