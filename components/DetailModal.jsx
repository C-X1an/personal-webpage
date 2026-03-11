import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import styles from '../styles/DetailModal.module.css';

const THEME_CLASSNAMES = {
  sakura: styles.themeSakura,
  spring: styles.themeSpring,
  fountain: styles.themeFountain,
  warm: styles.themeWarm,
};

function getFocusableElements(node) {
  if (!node) {
    return [];
  }

  return Array.from(
    node.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export default function DetailModal({
  isOpen,
  theme = 'sakura',
  eyebrow,
  title,
  subtitle,
  onClose,
  actions,
  children,
}) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return undefined;
    }

    const previousActiveElement = document.activeElement;
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);

      if (focusableElements.length === 0) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        event.stopPropagation();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        event.stopPropagation();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section
        ref={dialogRef}
        className={clsx(styles.dialog, THEME_CLASSNAMES[theme])}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        aria-describedby={subtitle ? 'detail-modal-subtitle' : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.copy}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            <h3 id="detail-modal-title" className={styles.title}>
              {title}
            </h3>
            {subtitle ? (
              <p id="detail-modal-subtitle" className={styles.subtitle}>
                {subtitle}
              </p>
            ) : null}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close detail dialog"
          >
            Close
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        {actions ? <footer className={styles.footer}>{actions}</footer> : null}
      </section>
    </div>,
    document.body,
  );
}
