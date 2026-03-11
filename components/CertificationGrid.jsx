import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import styles from '../styles/ContentPanels.module.css';

export default function CertificationGrid({ items = [] }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(debouncedQuery),
  );

  return (
    <div className={styles.certShell}>
      <div className={styles.searchRow}>
        <label className={styles.searchLabel}>
          <span>Search certification titles</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.searchInput}
            placeholder="Search by title"
            aria-label="Search certifications by title"
          />
        </label>
        <div className={styles.searchSummary} aria-live="polite">
          {filteredItems.length} certification{filteredItems.length === 1 ? '' : 's'}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className={styles.emptyState}>
          No certifications match that search yet.
        </p>
      ) : (
        <div className={styles.certGrid}>
          {filteredItems.map((item) => (
            <article key={item.id} className={styles.certCard}>
              <div className={styles.certThumbFrame}>
                {item.imageSrc ? (
                  <Image
                    src={item.imageSrc}
                    alt={`${item.title} certification preview`}
                    className={styles.certThumb}
                    fill
                    sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : null}
              </div>

              <div className={styles.cardMeta}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <span className={styles.metaStrong}>{item.issuer}</span>
                <span>{item.date}</span>
              </div>

              <div className={styles.cardActions}>
                {item.fileSrc ? (
                  <a
                    href={item.fileSrc}
                    download
                    className={styles.actionLink}
                    aria-label={`Download ${item.title}`}
                  >
                    Download certificate
                  </a>
                ) : null}
                <Link href="/certifications" className={styles.subtleLink}>
                  Open page
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
