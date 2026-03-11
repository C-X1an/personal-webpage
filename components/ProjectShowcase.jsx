import Image from 'next/image';

import styles from '../styles/ContentPanels.module.css';

export default function ProjectShowcase({ items = [] }) {
  return (
    <div className={styles.projectGrid}>
      {items.map((project) => (
        <article key={project.id} className={styles.projectCard}>
          <div className={styles.projectVisual} aria-hidden="true">
            {project.thumbnailSrc ? (
              <Image
                src={project.thumbnailSrc}
                alt=""
                fill
                sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : null}
          </div>

          <div className={styles.cardMeta}>
            <h3 className={styles.cardTitle}>{project.title}</h3>
            <span className={styles.metaStrong}>{project.primary_language}</span>
            <span>{project.short}</span>
          </div>

          <p className={styles.projectDescription}>{project.description}</p>

          <div className={styles.tagList} aria-label={`${project.title} tags`}>
            {(project.tags || []).map((tag) => (
              <span key={`${project.id}-${tag}`} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.cardActions}>
            <a
              href={project.repo_url}
              target="_blank"
              rel="noreferrer"
              className={styles.actionLink}
              aria-label={`View ${project.title} on GitHub`}
            >
              View on GitHub
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
