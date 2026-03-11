import Image from 'next/image';
import { useState } from 'react';

import DetailModal from './DetailModal';
import styles from '../styles/ContentPanels.module.css';

const PROJECT_ARCHIVE_URL = 'https://github.com/C-X1an?tab=repositories';

export default function ProjectShowcase({ items = [] }) {
  const [activeProjectId, setActiveProjectId] = useState(null);
  const activeProject = items.find((item) => item.id === activeProjectId) || null;

  return (
    <>
      <div className={styles.searchRow}>
        <p className={styles.emptyState}>
          Open a project card for details, or jump to the full repository list in a new tab.
        </p>
        <a
          href={PROJECT_ARCHIVE_URL}
          target="_blank"
          rel="noreferrer"
          className={styles.sectionAction}
        >
          View All Projects
        </a>
      </div>

      <div className={styles.projectGrid}>
        {items.map((project) => (
          <article key={project.id} className={styles.projectCard}>
            <div className={styles.projectVisual} aria-hidden="true">
              {project.thumbnailSrc ? (
                <Image
                  src={project.thumbnailSrc}
                  alt={`${project.title} project preview`}
                  fill
                  sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : null}
            </div>

            <div className={styles.cardMeta}>
              <h3 className={styles.cardTitle}>{project.title}</h3>
              <span className={styles.metaStrong}>{project.short}</span>
            </div>

            <div className={styles.tagList} aria-label={`${project.title} tags`}>
              {(project.tags || []).map((tag) => (
                <span key={`${project.id}-${tag}`} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div className={styles.cardActions}>
              <button
                type="button"
                className={styles.inlineActionButton}
                onClick={() => setActiveProjectId(project.id)}
                aria-haspopup="dialog"
                aria-label={`Open details for ${project.title}`}
              >
                Open details
              </button>
              {project.repo_url ? (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.subtleLink}
                >
                  GitHub
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <DetailModal
        isOpen={Boolean(activeProject)}
        theme="spring"
        eyebrow="Playground build"
        title={activeProject?.title}
        subtitle={activeProject?.primary_language}
        onClose={() => setActiveProjectId(null)}
        actions={
          activeProject?.repo_url ? (
            <a
              href={activeProject.repo_url}
              target="_blank"
              rel="noreferrer"
              className={styles.actionLink}
            >
              View on GitHub
            </a>
          ) : null
        }
      >
        <div className={styles.detailStack}>
          {activeProject?.thumbnailSrc ? (
            <div className={styles.detailMediaFrame}>
              <Image
                src={activeProject.thumbnailSrc}
                alt={`${activeProject.title} project preview`}
                fill
                className={styles.detailMedia}
                sizes="(max-width: 900px) 100vw, 60vw"
              />
            </div>
          ) : null}

          <div className={styles.detailText}>
            <p className={styles.detailSummary}>{activeProject?.description}</p>
            <div className={styles.tagList}>
              {(activeProject?.tags || []).map((tag) => (
                <span key={`${activeProject?.id}-${tag}`} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DetailModal>
    </>
  );
}
