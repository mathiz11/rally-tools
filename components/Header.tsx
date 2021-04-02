import React from "react";
import { Icon } from "semantic-ui-react";
import { SemanticICONS } from "semantic-ui-react/dist/commonjs/generic";
import Link from "next/link";

type HeaderProps = {
  title: string;
  iconName: SemanticICONS;
};

export default function Header({ title, iconName }: HeaderProps) {
  return (
    <header>
      <Link href="/">
        <a>
          <h1>{title}</h1>
          <Icon name={iconName} />
        </a>
      </Link>
    </header>
  );
}
