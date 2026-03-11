import Head from 'next/head';
import Link from 'next/link';

import EducationTimeline from '../components/EducationTimeline';
import { getTimelineItems } from '../lib/content';
import styles from '../styles/ContentPanels.module.css';

export default function EducationPage({ timelineItems }) {
  return (
    <>
      <Head>
        <title>Chong Xian | Education and Work</title>
        <meta
          name="description"
          content="Evenly spaced education and work timeline for Chong Xian's portfolio."
        />
      </Head>

      <main className={styles.standalonePage}>
        <div className={styles.pageFrame}>
          <header className={styles.pageHeader}>
            <p className={styles.eyebrow}>Fountain timeline</p>
            <h1 className={styles.title}>Education and work</h1>
            <p className={styles.lead}>
              This route mirrors the fountain panel with a readable, evenly
              spaced timeline that works without the 3D scene.
            </p>
            <nav className={styles.pageNav} aria-label="Education page navigation">
              <Link href="/" className={styles.pageNavLink}>
                Back home
              </Link>
              <Link href="/certifications" className={styles.pageNavLink}>
                Certifications
              </Link>
            </nav>
          </header>

          <EducationTimeline items={timelineItems} />
        </div>
      </main>
    </>
  );
}

export function getStaticProps() {
  return {
    props: {
      timelineItems: getTimelineItems(),
    },
  };
}
