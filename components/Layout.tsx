import React, { ReactChild } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { SemanticICONS } from "semantic-ui-react/dist/commonjs/generic";

type LayoutProps = {
  title: string;
  iconName: SemanticICONS;
  children: ReactChild;
};

export default function Layout({ title, iconName, children }: LayoutProps) {
  return (
    <div>
      <Head>
        <title>Rally tools</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header title={title} iconName={iconName} />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
