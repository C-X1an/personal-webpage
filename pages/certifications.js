import Head from 'next/head';
import Link from 'next/link';

import CertificationGrid from '../components/CertificationGrid';
import { getCertifications } from '../lib/content';
import styles from '../styles/ContentPanels.module.css';

export default function CertificationsPage({ certifications }) {
  return (
    <>
      <Head>
        <title>Chong Xian | Certifications</title>
        <meta
          name="description"
          content="Searchable certification archive for Chong Xian's portfolio."
        />
      </Head>

      <main className={styles.standalonePage}>
        <div className={styles.pageFrame}>
          <header className={styles.pageHeader}>
            <p className={styles.eyebrow}>Sakura archive</p>
            <h1 className={styles.title}>Certifications</h1>
            <p className={styles.lead}>
              The same certification data powers the sakura modal inside the
              desktop garden, including searchable cards and in-place preview
              dialogs.
            </p>
            <nav className={styles.pageNav} aria-label="Certification page navigation">
              <Link href="/" className={styles.pageNavLink}>
                Back home
              </Link>
              <Link href="/education" className={styles.pageNavLink}>
                Education timeline
              </Link>
            </nav>
          </header>

          <CertificationGrid items={certifications} showArchiveAction={false} />
        </div>
      </main>
    </>
  );
}

export function getStaticProps() {
  return {
    props: {
      certifications: getCertifications(),
    },
  };
}
