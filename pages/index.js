import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

import Hero from '../components/Hero';
import styles from '../styles/Hero.module.css';

const GardenCanvas = dynamic(() => import('../components/GardenCanvas'), {
  ssr: false,
  loading: () => (
    <div className={styles.gardenLoading} aria-live="polite">
      <span className={styles.loadingOrb} aria-hidden="true" />
      <span>Opening garden...</span>
    </div>
  ),
});

const DESKTOP_QUERY = '(min-width: 900px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const HERO_ZOOM_DURATION_MS = 600;

const fallbackCards = [
  {
    id: 'projects',
    title: 'Projects',
    body:
      'PR Brief and Driftline stay reachable in the 2D path while the 3D pavilion remains desktop-only.',
  },
  {
    id: 'certifications',
    title: 'Certifications',
    body:
      'CS50 Cybersecurity, CS50AI, CS50P, and CS50x anchor the sakura branch for the first mobile pass.',
  },
  {
    id: 'timeline',
    title: 'Education and Work',
    body:
      'TMJC, NTU, and Setsco Services map to the timeline and fountain panels for later tasks.',
  },
  {
    id: 'contact',
    title: 'Contact',
    body:
      'The kiosk remains a simple HTML section on smaller screens so the first entry flow stays lightweight.',
  },
];

export default function HomePage() {
  const [heroPhase, setHeroPhase] = useState('idle');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [shouldMountGarden, setShouldMountGarden] = useState(false);
  const zoomTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const syncMotionPreference = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    syncMotionPreference(motionQuery);

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', syncMotionPreference);

      return () => {
        motionQuery.removeEventListener('change', syncMotionPreference);
      };
    }

    motionQuery.addListener(syncMotionPreference);

    return () => {
      motionQuery.removeListener(syncMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined' || !shouldMountGarden) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldMountGarden]);

  useEffect(() => {
    return () => {
      if (zoomTimerRef.current) {
        clearTimeout(zoomTimerRef.current);
      }
    };
  }, []);

  function handleHeroTicketClick() {
    if (heroPhase !== 'idle' || shouldMountGarden || typeof window === 'undefined') {
      return;
    }

    setHeroPhase('zooming');

    if (zoomTimerRef.current) {
      clearTimeout(zoomTimerRef.current);
    }

    zoomTimerRef.current = window.setTimeout(() => {
      if (window.matchMedia(DESKTOP_QUERY).matches) {
        setShouldMountGarden(true);
        setHeroPhase('garden');
        return;
      }

      const contentSection = document.getElementById('content');
      contentSection?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });

      setHeroPhase('idle');
    }, prefersReducedMotion ? 0 : HERO_ZOOM_DURATION_MS);
  }

  function handleCloseGarden() {
    if (zoomTimerRef.current) {
      clearTimeout(zoomTimerRef.current);
    }

    setShouldMountGarden(false);
    setHeroPhase('idle');
  }

  return (
    <>
      <Head>
        <title>Chong Xian | Garden Entry</title>
        <meta
          name="description"
          content="Fullscreen hero entry into Chong Xian's garden portfolio with a desktop-only procedural scene."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>

      <main className={styles.pageShell}>
        <section className={styles.heroViewport}>
          <Hero
            onTicketClick={handleHeroTicketClick}
            isTransitioning={heroPhase !== 'idle'}
            isGardenOpen={shouldMountGarden}
          />

          {shouldMountGarden ? (
            <GardenCanvas onExit={handleCloseGarden} />
          ) : null}
        </section>

        <section
          id="content"
          className={styles.contentSection}
          aria-labelledby="content-title"
        >
          <div className={styles.contentHeader}>
            <p className={styles.contentEyebrow}>2D fallback</p>
            <h1 id="content-title" className={styles.contentTitle}>
              Garden content stays reachable without the canvas.
            </h1>
            <p className={styles.contentLead}>
              Smaller viewports skip WebGL entirely and land here after the hero
              zoom so the portfolio remains fast, readable, and keyboard-safe.
            </p>
          </div>

          <div className={styles.cardGrid}>
            {fallbackCards.map((card) => (
              <article key={card.id} className={styles.contentCard}>
                <h2 className={styles.cardTitle}>{card.title}</h2>
                <p className={styles.cardBody}>{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
