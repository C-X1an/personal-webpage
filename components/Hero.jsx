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
  zoomProgress = 0,
  isDesktop = false,
}) {
  const phaseClassName = getHeroPhaseClassName(phase);
  const imageScale = 1 + zoomProgress * 2.7;
  const imageTranslateY = zoomProgress * 16;
  const imageTranslateX = zoomProgress * 1.2;
  const scrimOpacity = 0.18 + (1 - zoomProgress) * 0.18;
  const bloomOpacity = 0.28 + zoomProgress * 0.34;
  const veilOpacity = 0.08 + zoomProgress * 0.34;

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
          style={{
            objectFit: isDesktop ? 'contain' : 'cover',
            objectPosition: isDesktop ? '50% 50%' : '50% 46%',
            transform: `translate3d(${imageTranslateX}%, ${imageTranslateY}%, 0) scale(${imageScale})`,
            filter: `saturate(${1 + zoomProgress * 0.14}) brightness(${1 + zoomProgress * 0.08})`,
          }}
          fill
          priority
          sizes="100vw"
        />
      </div>

      <div className={styles.scrim} style={{ opacity: scrimOpacity }} aria-hidden="true" />
      <div
        className={styles.gateBloom}
        style={{ opacity: bloomOpacity }}
        aria-hidden="true"
      />
      <div
        className={styles.transitionVeil}
        style={{ opacity: veilOpacity }}
        aria-hidden="true"
      />

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
          FREE TICKET
        </button>
      </div>
    </section>
  );
}
