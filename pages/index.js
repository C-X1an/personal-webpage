import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import CertificationGrid from '../components/CertificationGrid';
import ContactPanel from '../components/ContactPanel';
import EducationTimeline from '../components/EducationTimeline';
import Hero from '../components/Hero';
import ProjectShowcase from '../components/ProjectShowcase';
import { getHomePageContent } from '../lib/content';
import contentStyles from '../styles/ContentPanels.module.css';
import styles from '../styles/Hero.module.css';

const GardenCanvas = dynamic(() => import('../components/GardenCanvas'), {
  ssr: false,
  loading: () => (
    <div className={styles.canvasLoading} aria-live="polite">
      Opening garden...
    </div>
  ),
});

const DESKTOP_BREAKPOINT = 900;
const HERO_ZOOM_DURATION_MS = 760;
const HERO_HOLD_DURATION_MS = 180;

export default function HomePage({ certifications, projects, timelineItems }) {
  const [heroPhase, setHeroPhase] = useState('idle');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [shouldMountGarden, setShouldMountGarden] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timerRef = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = (event) => setPrefersReducedMotion(event.matches);

    updateReducedMotion(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateReducedMotion);

      return () => {
        mediaQuery.removeEventListener('change', updateReducedMotion);
      };
    }

    mediaQuery.addListener(updateReducedMotion);

    return () => {
      mediaQuery.removeListener(updateReducedMotion);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;

    if (heroPhase !== 'idle' || shouldMountGarden || isModalOpen) {
      root.style.overflow = 'hidden';
    } else {
      root.style.overflow = previousOverflow;
    }

    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [heroPhase, isModalOpen, shouldMountGarden]);

  useEffect(() => {
    return () => {
      timerRef.current.forEach((timer) => window.clearTimeout(timer));
      timerRef.current = [];
    };
  }, []);

  function clearTimers() {
    timerRef.current.forEach((timer) => window.clearTimeout(timer));
    timerRef.current = [];
  }

  function schedule(callback, delay) {
    const timer = window.setTimeout(callback, delay);
    timerRef.current.push(timer);
    return timer;
  }

  function handleMobileFallback() {
    const contentSection = document.getElementById('content');

    contentSection?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });

    schedule(() => {
      setHeroPhase('idle');
    }, prefersReducedMotion ? 0 : 120);
  }

  function handleHeroTicketClick() {
    if (typeof window === 'undefined' || heroPhase !== 'idle') {
      return;
    }

    clearTimers();

    const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;

    if (prefersReducedMotion) {
      if (isDesktop) {
        setShouldMountGarden(true);
        setHeroPhase('open');
      } else {
        handleMobileFallback();
      }

      return;
    }

    setHeroPhase('zooming');

    schedule(() => {
      setHeroPhase('holding');

      schedule(() => {
        if (isDesktop) {
          setShouldMountGarden(true);
          setHeroPhase('open');
        } else {
          handleMobileFallback();
        }
      }, HERO_HOLD_DURATION_MS);
    }, HERO_ZOOM_DURATION_MS);
  }

  function handleCloseGarden() {
    clearTimers();
    setIsModalOpen(false);
    setShouldMountGarden(false);
    setHeroPhase('idle');
  }

  return (
    <>
      <Head>
        <title>Chong Xian | Garden Entry</title>
        <meta
          name="description"
          content="Interactive garden portfolio entry with a fullscreen hero, projected waypoints, themed panels, and accessible 2D fallback content."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>

      <main className={styles.pageShell}>
        <section className={styles.heroViewport}>
          <Hero onTicketClick={handleHeroTicketClick} phase={heroPhase} />

          {shouldMountGarden ? (
            <GardenCanvas
              certifications={certifications}
              projects={projects}
              timelineItems={timelineItems}
              reducedMotion={prefersReducedMotion}
              onExit={handleCloseGarden}
              onModalChange={setIsModalOpen}
            />
          ) : null}
        </section>

        <section
          id="content"
          className={styles.contentSection}
          aria-labelledby="content-title"
        >
          <div className={styles.contentInner}>
            <header className={styles.contentIntro}>
              <p className={styles.contentEyebrow}>2D garden path</p>
              <h1 id="content-title" className={styles.contentTitle}>
                Every portfolio section stays readable without the canvas.
              </h1>
              <p className={styles.contentLead}>
                Smaller screens skip WebGL entirely and land on this layered
                content path instead. The same data drives the standalone
                section pages and the desktop garden panels.
              </p>
              <div className={styles.routeRow}>
                <Link href="/certifications" className={styles.routeLink}>
                  Certifications page
                </Link>
                <Link href="/education" className={styles.routeLink}>
                  Education timeline
                </Link>
              </div>
            </header>

            <div className={styles.sectionDeck}>
              <article className={styles.sectionCard} id="projects">
                <div className={contentStyles.sectionHeader}>
                  <p className={contentStyles.eyebrow}>Playground</p>
                  <h2 className={contentStyles.title}>Projects</h2>
                  <p className={contentStyles.lead}>
                    Product and tooling work stays visible in a fast HTML path.
                  </p>
                </div>
                <ProjectShowcase items={projects} />
              </article>

              <article className={styles.sectionCard} id="certifications">
                <div className={contentStyles.sectionHeader}>
                  <p className={contentStyles.eyebrow}>Sakura branch</p>
                  <h2 className={contentStyles.title}>Certifications</h2>
                  <p className={contentStyles.lead}>
                    Searchable certification cards are available here and in the
                    sakura panel.
                  </p>
                </div>
                <CertificationGrid items={certifications} />
              </article>

              <article className={styles.sectionCard} id="education">
                <div className={contentStyles.sectionHeader}>
                  <p className={contentStyles.eyebrow}>Fountain route</p>
                  <h2 className={contentStyles.title}>Education and work</h2>
                  <p className={contentStyles.lead}>
                    The vertical timeline keeps an even rhythm while scaling
                    across different entry lengths.
                  </p>
                </div>
                <EducationTimeline items={timelineItems} />
              </article>

              <article className={styles.sectionCard} id="contact">
                <ContactPanel />
              </article>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export function getStaticProps() {
  return {
    props: getHomePageContent(),
  };
}
