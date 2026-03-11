import Link from 'next/link';

import styles from '../styles/ContentPanels.module.css';

export default function EducationTimeline({ items = [] }) {
  return (
    <div className={styles.sectionStack}>
      <div className={styles.sectionLinks}>
        <Link href="/education" className={styles.subtleLink}>
          Open timeline page
        </Link>
      </div>

      <div
        className={styles.timeline}
        style={{ '--timeline-count': items.length || 1 }}
      >
        {items.map((item) => (
          <article key={item.id} className={styles.timelineItem}>
            <span className={styles.timelineDot} aria-hidden="true" />
            <div className={styles.timelineCard}>
              <div className={styles.cardMeta}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.timelineMeta}>
                  <span className={styles.metaStrong}>{item.organization}</span>
                  <span>{item.dateLabel}</span>
                </div>
              </div>

              {item.bullets?.length ? (
                <ul className={styles.timelineBullets}>
                  {item.bullets.map((bullet) => (
                    <li key={`${item.id}-${bullet}`}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
