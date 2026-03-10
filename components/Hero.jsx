import clsx from 'clsx';
import Image from 'next/image';

import heroImage from '../assets/images/hero.png';
import styles from '../styles/Hero.module.css';

export default function Hero({ onTicketClick, statusMessage }) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.imageFrame}>
        <Image
          src={heroImage}
          alt="Garden gate illustration for Chong Xian's portfolio"
          className={styles.image}
          fill
          priority
          sizes="100vw"
        />
      </div>

      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.eyebrow}>Morning garden portfolio</p>
        <h1 id="hero-title" className={styles.title}>
          Step through the gate and into Chong Xian&apos;s work.
        </h1>
        <p className={styles.summary}>
          The first release keeps the landing view lightweight while preparing
          the handoff into the interactive garden experience.
        </p>

        <button
          type="button"
          className={styles.ticketButton}
          onClick={onTicketClick}
        >
          Free ticket
        </button>

        <p
          className={clsx(styles.status, {
            [styles.statusVisible]: Boolean(statusMessage),
          })}
          aria-live="polite"
        >
          {statusMessage || ' '}
        </p>
      </div>
    </section>
  );
}
