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

const DESKTOP_BREAKPOINT = 960;
const HERO_TRANSITION_MS = 1550;
const loadGardenCanvas = () => import('../components/GardenCanvas');

const GardenCanvas = dynamic(loadGardenCanvas, {
  ssr: false,
  loading: () => (
    <div className={styles.canvasLoading} aria-live="polite">
      Preparing garden...
    </div>
  ),
});

export default function HomePage({ certifications, projects, timelineItems }) {
  const [heroPhase, setHeroPhase] = useState('idle');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [shouldMountGarden, setShouldMountGarden] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timerRef = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);

    const updateReducedMotion = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    const updateViewport = (event) => {
      setIsDesktopViewport(event.matches);
    };

    updateReducedMotion(motionQuery);
    updateViewport(desktopQuery);

    const addListener = (mediaQuery, callback) => {
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', callback);
        return () => mediaQuery.removeEventListener('change', callback);
      }

      mediaQuery.addListener(callback);
      return () => mediaQuery.removeListener(callback);
    };

    const removeMotionListener = addListener(motionQuery, updateReducedMotion);
    const removeViewportListener = addListener(desktopQuery, updateViewport);

    return () => {
      removeMotionListener();
      removeViewportListener();
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined' || !isDesktopViewport) {
      return undefined;
    }

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousRootOverscroll = root.style.overscrollBehavior;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    root.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      root.style.overscrollBehavior = previousRootOverscroll;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, [isDesktopViewport, heroPhase, shouldMountGarden, isModalOpen]);

  useEffect(() => {
    if (isDesktopViewport) {
      return;
    }

    clearTimers(timerRef);
    setIsModalOpen(false);
    setShouldMountGarden(false);
    setHeroPhase('idle');
  }, [isDesktopViewport]);

  useEffect(() => {
    return () => {
      clearTimers(timerRef);
    };
  }, []);

  function schedule(callback, delay) {
    const timer = window.setTimeout(callback, delay);
    timerRef.current.push(timer);
  }

  function handleMobileFallback() {
    const contentSection = document.getElementById('mobile-content');

    contentSection?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  function preloadGarden() {
    if (isDesktopViewport) {
      loadGardenCanvas();
    }
  }

  function handleHeroTicketClick() {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isDesktopViewport) {
      handleMobileFallback();
      return;
    }

    if (heroPhase !== 'idle') {
      return;
    }

    clearTimers(timerRef);
    preloadGarden();
    setShouldMountGarden(true);

    if (prefersReducedMotion) {
      setHeroPhase('open');
      return;
    }

    setHeroPhase('entering');
    schedule(() => {
      setHeroPhase('open');
    }, HERO_TRANSITION_MS);
  }

  function handleCloseGarden() {
    clearTimers(timerRef);
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
          content="Interactive garden portfolio entry with a full-viewport hero, projected waypoints, themed panels, and a mobile 2D fallback."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>

      <main className={styles.pageShell}>
        <section className={styles.desktopStage}>
          {shouldMountGarden && isDesktopViewport ? (
            <GardenCanvas
              certifications={certifications}
              projects={projects}
              timelineItems={timelineItems}
              reducedMotion={prefersReducedMotion}
              transitionState={heroPhase}
              onExit={handleCloseGarden}
              onModalChange={setIsModalOpen}
            />
          ) : null}

          <Hero
            onTicketClick={handleHeroTicketClick}
            onTicketIntent={preloadGarden}
            phase={heroPhase}
            isDesktop={isDesktopViewport}
          />
        </section>

        <section
          id="mobile-content"
          className={styles.mobileContentSection}
          aria-labelledby="mobile-content-title"
        >
          <div className={styles.contentInner}>
            <header className={styles.contentIntro}>
              <p className={styles.contentEyebrow}>2D garden path</p>
              <h1 id="mobile-content-title" className={styles.contentTitle}>
                The same portfolio content remains fully readable without the 3D
                scene.
              </h1>
              <p className={styles.contentLead}>
                On smaller screens the site stays as a layered, scrollable
                experience with the same projects, certificates, timeline, and
                contact routes.
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
                    Searchable certificate cards are available here and in the
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
                    The vertical timeline is ordered from newest to oldest and
                    opens full details on demand.
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

function clearTimers(timerRef) {
  timerRef.current.forEach((timer) => window.clearTimeout(timer));
  timerRef.current = [];
}

export function getStaticProps() {
  return {
    props: getHomePageContent(),
  };
}
