import clsx from 'clsx';
import Image from 'next/image';

import heroImage from '../assets/images/hero.png';
import styles from '../styles/Hero.module.css';

export const HERO_PHASE_CLASSES = {
  idle: '',
  entering: 'entering',
  open: 'open',
};

export function getHeroPhaseClassName(phase = 'idle') {
  return HERO_PHASE_CLASSES[phase] || '';
}

export default function Hero({
  onTicketClick,
  onTicketIntent,
  phase = 'idle',
  isDesktop = false,
}) {
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
      <div className={styles.gateBloom} aria-hidden="true" />
      <div className={styles.transitionVeil} aria-hidden="true" />

      <div className={styles.heroGate}>
        <button
          type="button"
          className={styles.ticketButton}
          onClick={onTicketClick}
          onMouseEnter={isDesktop ? onTicketIntent : undefined}
          onFocus={isDesktop ? onTicketIntent : undefined}
          aria-controls={isDesktop ? 'desktop-garden' : 'mobile-content'}
          aria-expanded={isDesktop && phase === 'open'}
          aria-haspopup={isDesktop ? 'dialog' : undefined}
          aria-label="Enter Chong Xian's garden with the free ticket"
          disabled={isDesktop && phase !== 'idle'}
        >
          free ticket
        </button>
      </div>
    </section>
  );
}
