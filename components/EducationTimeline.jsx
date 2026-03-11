import { useState } from 'react';

import DetailModal from './DetailModal';
import styles from '../styles/ContentPanels.module.css';

export default function EducationTimeline({ items = [], theme = 'fountain' }) {
  const [activeItemId, setActiveItemId] = useState(null);
  const activeItem = items.find((item) => item.id === activeItemId) || null;

  return (
    <>
      <div
        className={styles.timeline}
        style={{ '--timeline-count': items.length || 1 }}
      >
        {items.map((item) => (
          <article key={item.id} className={styles.timelineItem}>
            <span className={styles.timelineDot} aria-hidden="true" />
            <button
              type="button"
              className={styles.timelineButton}
              onClick={() => setActiveItemId(item.id)}
              aria-haspopup="dialog"
              aria-label={`Open ${item.title} details`}
            >
              <div className={styles.timelinePreview}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <span className={styles.metaStrong}>{item.organization}</span>
              </div>
              <span className={styles.timelineHint}>View details</span>
            </button>
          </article>
        ))}
      </div>

      <DetailModal
        isOpen={Boolean(activeItem)}
        theme={theme}
        eyebrow={activeItem?.kind === 'job' ? 'Work timeline' : 'Education timeline'}
        title={activeItem?.title}
        subtitle={activeItem?.dateLabel}
        onClose={() => setActiveItemId(null)}
      >
        <div className={styles.detailText}>
          <p className={styles.detailSummary}>{activeItem?.organization}</p>
          {activeItem?.bullets?.length ? (
            <ul className={styles.timelineBullets}>
              {activeItem.bullets.map((bullet) => (
                <li key={`${activeItem.id}-${bullet}`}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </DetailModal>
    </>
  );
}
