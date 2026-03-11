import clsx from 'clsx';
import Image from 'next/image';

import heroImage from '../assets/images/hero.png';
import styles from '../styles/Hero.module.css';

export default function Hero({
  onTicketClick,
  isTransitioning = false,
  isGardenOpen = false,
}) {
  return (
    <section
      className={clsx(styles.hero, {
        [styles.heroTransitioning]: isTransitioning,
        [styles.heroGardenOpen]: isGardenOpen,
      })}
      aria-label="Chong Xian's garden entrance"
    >
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

      <div className={styles.heroTint} aria-hidden="true" />
      <div className={styles.heroGlow} aria-hidden="true" />

      <div className={styles.heroCenter}>
        <button
          type="button"
          role="button"
          tabIndex={0}
          aria-label="Enter Chong Xian's garden (free ticket)"
          className={styles.ticketButton}
          onClick={onTicketClick}
        >
          Free ticket
        </button>
      </div>
    </section>
  );
}
