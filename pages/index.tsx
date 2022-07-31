import Link from "next/link";
import { Icon, Container } from "semantic-ui-react";
import Layout from "../components/Layout";
import React from "react";

export default function Home() {
  return (
    <Layout title="Calculateur Rallye" iconName="car">
      <Container>
        <div className="links-container">
          <Link href="/tools/fuel">
            <a>
              <h2>Calulateur essence</h2>
              <Icon name="arrow right" />
            </a>
          </Link>
          <Link href="/tools/wheel">
            <a>
              <h2>Vitesse roue</h2>
              <Icon name="arrow right" />
            </a>
          </Link>
          <Link href="/tools/volumetric">
            <a>
              <h2>Calcul volumétrique</h2>
              <Icon name="arrow right" />
            </a>
          </Link>
        </div>
      </Container>
    </Layout>
  );
}
