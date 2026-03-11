import clsx from 'clsx';
import { useEffect, useRef } from 'react';

import styles from '../styles/ModalPanel.module.css';

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

export default function ModalPanel({
  isOpen,
  theme = 'sakura',
  eyebrow,
  title,
  intro,
  onClose,
  children,
}) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousActiveElement = document.activeElement;
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section
        ref={dialogRef}
        className={clsx(styles.dialog, THEME_CLASSNAMES[theme])}
        role="dialog"
        aria-modal="true"
        aria-labelledby="garden-modal-title"
        aria-describedby="garden-modal-intro"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.copy}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            <h2 id="garden-modal-title" className={styles.title}>
              {title}
            </h2>
            {intro ? (
              <p id="garden-modal-intro" className={styles.intro}>
                {intro}
              </p>
            ) : null}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close panel"
          >
            Close
          </button>
        </header>

        <div className={styles.body}>{children}</div>
      </section>
    </div>
  );
}
