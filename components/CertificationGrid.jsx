import Image from 'next/image';
import { useDeferredValue, useState } from 'react';

import DetailModal from './DetailModal';
import styles from '../styles/ContentPanels.module.css';

export default function CertificationGrid({
  items = [],
  showArchiveAction = true,
  archiveHref = '/certifications',
}) {
  const [query, setQuery] = useState('');
  const [activeCertificationId, setActiveCertificationId] = useState(null);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const activeCertification =
    items.find((item) => item.id === activeCertificationId) || null;

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(deferredQuery),
  );

  return (
    <>
      <div className={styles.certShell}>
        <div className={styles.searchRow}>
          <div className={styles.searchControl}>
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
              {filteredItems.length} certification
              {filteredItems.length === 1 ? '' : 's'}
            </div>
          </div>

          {showArchiveAction ? (
            <a href={archiveHref} className={styles.sectionAction}>
              View all certifications
            </a>
          ) : null}
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
                      sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : null}
                </div>

                <div className={styles.cardMeta}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <span className={styles.metaStrong}>{item.issuer}</span>
                  <span className={styles.metaLine}>{item.date}</span>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.inlineActionButton}
                    onClick={() => setActiveCertificationId(item.id)}
                    aria-haspopup="dialog"
                    aria-label={`View ${item.title} certificate`}
                  >
                    View Certificate
                  </button>
                  {item.fileSrc ? (
                    <a href={item.fileSrc} download className={styles.subtleLink}>
                      Download
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <DetailModal
        isOpen={Boolean(activeCertification)}
        theme="sakura"
        eyebrow={activeCertification?.issuer}
        title={activeCertification?.title}
        subtitle={activeCertification?.date}
        onClose={() => setActiveCertificationId(null)}
        actions={
          activeCertification?.fileSrc ? (
            <a
              href={activeCertification.fileSrc}
              download
              className={styles.actionLink}
            >
              Download certificate
            </a>
          ) : null
        }
      >
        <div className={styles.detailStack}>
          <div className={styles.detailMediaFrame}>
            {activeCertification?.imageSrc ? (
              <Image
                src={activeCertification.imageSrc}
                alt={`${activeCertification.title} enlarged certificate preview`}
                className={styles.detailMedia}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 60vw"
              />
            ) : (
              <div className={styles.emptyState}>Preview image unavailable.</div>
            )}
          </div>

          <div className={styles.detailText}>
            <p className={styles.detailSummary}>
              Issued by {activeCertification?.issuer} and stored locally as a
              downloadable PDF.
            </p>
          </div>
        </div>
      </DetailModal>
    </>
  );
}
