import Head from 'next/head';
import { useState } from 'react';

import ContactForm from '../components/ContactForm';
import Hero from '../components/Hero';
import styles from '../styles/Home.module.css';

const PLACEHOLDER_MESSAGE =
  'Free ticket selected. The zoom transition and desktop garden loader will be wired in the next task.';

export default function HomePage() {
  const [heroStatus, setHeroStatus] = useState('');

  function handleHeroTicketClick() {
    setHeroStatus(PLACEHOLDER_MESSAGE);
  }

  return (
    <>
      <Head>
        <title>Chong Xian | Portfolio Garden</title>
        <meta
          name="description"
          content="Portfolio site for Chong Xian with a desktop garden experience and an accessible mobile fallback."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>

      <main className={styles.page}>
        <Hero
          onTicketClick={handleHeroTicketClick}
          statusMessage={heroStatus}
        />

        <section className={styles.previewSection} aria-labelledby="site-preview">
          <div className={styles.copyBlock}>
            <p className={styles.eyebrow}>Desktop-first preview</p>
            <h2 id="site-preview" className={styles.heading}>
              The hero is ready for the garden handoff.
            </h2>
            <p className={styles.lead}>
              This scaffold keeps the first task focused on the Pages Router
              setup, the accessible hero CTA, and the contact surface that will
              be wired to Formspree in a later task.
            </p>
            <ul className={styles.featureList}>
              <li>Desktop 3D canvas remains lazy and out of the critical path.</li>
              <li>Mobile keeps a readable HTML-first layout without canvas code.</li>
              <li>Contact delivery is intentionally placeholder-only for now.</li>
            </ul>
          </div>

          <ContactForm />
        </section>
      </main>
    </>
  );
}
