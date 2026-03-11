import clsx from 'clsx';
import Image from 'next/image';

import heroImage from '../assets/images/hero.png';
import styles from '../styles/Hero.module.css';

export const HERO_PHASE_CLASSES = {
  idle: '',
  zooming: 'zooming',
  holding: 'holding',
  open: 'open',
};

export function getHeroPhaseClassName(phase = 'idle') {
  return HERO_PHASE_CLASSES[phase] || '';
}

export default function Hero({ onTicketClick, phase = 'idle' }) {
  const phaseClassName = getHeroPhaseClassName(phase);

  return (
    <section
      className={clsx(styles.hero, {
        [styles[phaseClassName]]: Boolean(phaseClassName),
      })}
      data-phase={phase}
      aria-label="Chong Xian's garden entrance"
    >
      <div className={styles.heroMedia}>
        <Image
          src={heroImage}
          alt="Garden gate illustration for Chong Xian's portfolio"
          className={styles.image}
          fill
          priority
          sizes="100vw"
        />
      </div>

      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.lens} aria-hidden="true" />

      <div className={styles.heroCenter}>
        <button
          type="button"
          className={styles.ticketButton}
          onClick={onTicketClick}
          aria-label="Enter Chong Xian's garden with the free ticket"
          disabled={phase !== 'idle'}
        >
          Free ticket
        </button>
      </div>
    </section>
  );
}
