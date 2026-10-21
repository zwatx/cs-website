import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { formatEventDate, getScheduledEvents, getTitleId } from '../lib/events.js';
import { getPracticeTypeHref } from '../lib/navigation.js';
import { useEventDate } from '../lib/event-clock.jsx';

// Homepage section ids from the components rendered by App.jsx.
const homeSections = [
  { label: 'What we do', href: '/#programs' },
  { label: 'Guest lectures', href: '/#speakers' },
  { label: 'Competitive programming', href: '/#tracks' },
  { label: 'Contests', href: '/#contests' },
  { label: 'Officers', href: '/#officers' },
  { label: 'Sponsors', href: '/#sponsors' },
  { label: 'Join', href: '/#join' }
];

// Each link sets the practice archive's Type filter and clears Year and Round.
const practiceArchives = [
  { type: 'all', label: 'All contests', detail: 'Every past UIL test, latest first' },
  { type: 'mc', label: 'Multiple choice', detail: 'Check as you go or take a 45-minute exam' },
  { type: 'frq', label: 'Programming FRQ', detail: 'Write Java and compare with the judge' }
];

function PanelLink ({ href, children }) {
  return <a className='site-nav-panel-link' href={href}>{children}</a>;
}

function HomePanel () {
  return (
    <ul className='site-nav-sections'>
      {homeSections.map((section) => (
        <li key={section.href}>
          <PanelLink href={section.href}>{section.label}</PanelLink>
        </li>
      ))}
    </ul>
  );
}

function EventsPanel () {
  const upcoming = getScheduledEvents(useEventDate()).slice(0, 3);

  return (
    <>
      {upcoming.length > 0
        ? (
          <ul className='site-nav-events'>
            {upcoming.map((event) => {
              const date = formatEventDate(event);
              return (
                <li key={`${event.date}-${event.title}`}>
                  {/* Matches the event title ids rendered by EventsPage. */}
                  <PanelLink href={`/events/#${getTitleId(event)}`}>
                    <time className='site-nav-event-date' dateTime={event.date}>
                      {date.startDateLabel}{date.endDateLabel ? `–${date.endDateLabel}` : ''}
                    </time>
                    <span className='site-nav-event-title'>{event.title}</span>
                  </PanelLink>
                </li>
              );
            })}
          </ul>
          )
        : <p className='site-nav-empty'>No dated events on the calendar yet.</p>}
      <div className='site-nav-panel-foot'>
        <PanelLink href='/events/'>
          All events <span className='action-arrow' aria-hidden='true'>→</span>
        </PanelLink>
      </div>
    </>
  );
}

function PracticePanel () {
  return (
    <ul className='site-nav-practice'>
      {practiceArchives.map((archive) => (
        <li key={archive.type}>
          <PanelLink href={getPracticeTypeHref(archive.type)}>
            <span className='site-nav-practice-label'>{archive.label}</span>
            <span className='site-nav-practice-detail'>{archive.detail}</span>
          </PanelLink>
        </li>
      ))}
    </ul>
  );
}

// Each page link is also its menu's trigger: hover opens its panel in the shared
// viewport, a click still follows the link, and ArrowDown opens the panel (a second
// ArrowDown enters it).
const menus = [
  { value: 'home', href: '/', label: 'Home', Panel: HomePanel },
  { value: 'events', href: '/events/', label: 'Events', Panel: EventsPanel },
  { value: 'practice', href: '/practice/', label: 'Practice', Panel: PracticePanel }
];

const menuIndex = (value) => menus.findIndex((menu) => menu.value === value);
const triggerId = (value) => `site-nav-${value}-link`;
const panelId = (value) => `site-nav-${value}-panel`;

// Hover waits before opening a panel, except while one is open or just closed so the
// pointer can sweep across links. Leaving waits briefly so the pointer can reach the panel.
const OPEN_DELAY = 120;
const SKIP_DELAY = 300;
const CLOSE_DELAY = 150;

// `shown` keeps the last panel mounted after closing, so the viewport fades out with
// it and reopening can reverse mid-transition. Switching panels slides the new one in
// from the side of the link it replaces while `leaving` holds the old one until its
// exit animation ends; opening from or closing to nothing doesn't slide.
const closedNav = { open: '', shown: '', motion: '', leaving: null };

function nextNav (nav, value) {
  if (value === nav.open) return nav;
  if (!value) return { ...nav, open: '', motion: '' };
  if (!nav.open) return { open: value, shown: value, motion: '', leaving: null };
  const forward = menuIndex(value) > menuIndex(nav.open);
  return {
    open: value,
    shown: value,
    motion: forward ? 'from-end' : 'from-start',
    leaving: { value: nav.open, motion: forward ? 'to-start' : 'to-end' }
  };
}

// Arrow keys step through a group without wrapping and Home and End jump to its ends.
// Keys the group doesn't use return undefined.
function stepFocus (elements, index, key, backKeys, nextKeys) {
  if (key === 'Home') return elements[0];
  if (key === 'End') return elements[elements.length - 1];
  if (backKeys.includes(key)) return elements[Math.max(index - 1, 0)];
  if (nextKeys.includes(key)) return elements[Math.min(index + 1, elements.length - 1)];
}

export default function Header ({ currentPage = 'home' }) {
  const [nav, setNav] = useState(closedNav);
  const [boxes, setBoxes] = useState(null);
  const navRef = useRef(null);
  const viewportRef = useRef(null);
  const timers = useRef({ open: 0, close: 0 });
  // A resting pointer opens its link once: after a click or Escape closes the panel,
  // it stays closed until the pointer leaves that link.
  const hovered = useRef('');
  const closedAt = useRef(-Infinity);
  const { open } = nav;

  const show = (value) => {
    clearTimeout(timers.current.open);
    clearTimeout(timers.current.close);
    setNav((previous) => nextNav(previous, value));
  };

  const startClose = () => {
    clearTimeout(timers.current.close);
    timers.current.close = setTimeout(() => show(''), CLOSE_DELAY);
  };

  useEffect(() => () => {
    clearTimeout(timers.current.open);
    clearTimeout(timers.current.close);
  }, []);

  // The header stays mounted across routes: a route change closes any panel and the
  // shared selection slides to the new page. Links are remeasured whenever fonts or
  // the viewport resize the navigation, which also places the open panel's indicator.
  useLayoutEffect(() => {
    show('');
    const links = menus.map((menu) => document.getElementById(triggerId(menu.value)));
    const measure = () => {
      const next = links.map((link) => ({ left: link.offsetLeft, width: link.offsetWidth }));
      setBoxes((previous) => previous && next.every((box, i) => box.left === previous[i].left && box.width === previous[i].width) ? previous : next);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [currentPage]);

  // While a panel is open the shared viewport takes its size, and Escape or a press
  // outside the navigation closes it. Escape from inside the panel returns focus to
  // its page link.
  useLayoutEffect(() => {
    if (!open) return;
    const viewport = viewportRef.current;
    const panel = document.getElementById(panelId(open));
    const fit = () => {
      viewport.style.setProperty('--nav-viewport-width', `${panel.offsetWidth}px`);
      viewport.style.setProperty('--nav-viewport-height', `${panel.offsetHeight}px`);
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit);
    if (observer) observer.observe(panel);
    else fit();
    const handlePointerDown = (event) => {
      if (!navRef.current.contains(event.target)) show('');
    };
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (viewport.contains(document.activeElement)) document.getElementById(triggerId(open)).focus();
      show('');
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      observer?.disconnect();
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
      clearTimeout(timers.current.open);
      clearTimeout(timers.current.close);
      closedAt.current = performance.now();
    };
  }, [open]);

  // Left and Right move between page links, and ArrowDown or Tab enters the open
  // panel. Inside it the arrows, Home, and End move between its links, and Tab past
  // either end returns to the page links around its trigger.
  const handleKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const { key, shiftKey, target } = event;
    const triggers = menus.map((menu) => document.getElementById(triggerId(menu.value)));
    const openIndex = menuIndex(open);
    const panel = open && document.getElementById(panelId(open));
    const links = panel ? Array.from(panel.getElementsByTagName('a')) : [];
    const triggerIndex = triggers.indexOf(target);
    const linkIndex = links.indexOf(target);
    let next;

    if (triggerIndex !== -1) {
      const isOpen = triggerIndex === openIndex;
      if (key === 'ArrowDown' && !isOpen) {
        event.preventDefault();
        show(menus[triggerIndex].value);
        return;
      }
      next = isOpen && (key === 'ArrowDown' || (key === 'Tab' && !shiftKey))
        ? links[0]
        : stepFocus(triggers, triggerIndex, key, ['ArrowLeft'], ['ArrowRight']);
    } else if (linkIndex !== -1 && key === 'Tab') {
      if (shiftKey && linkIndex === 0) next = triggers[openIndex];
      if (!shiftKey && linkIndex === links.length - 1) {
        // The viewport follows the page links in tab order, so moving on to the next
        // page link closes this panel rather than letting Tab reach it again.
        next = triggers[openIndex + 1];
        if (next) show('');
      }
    } else if (linkIndex !== -1) {
      next = stepFocus(links, linkIndex, key, ['ArrowUp', 'ArrowLeft'], ['ArrowDown', 'ArrowRight']);
    }

    if (!next) return;
    if (triggerIndex !== -1 && next !== target && open && next !== triggers[openIndex] && triggers.includes(next)) show('');
    event.preventDefault();
    next.focus();
  };

  // Focus moving out of the navigation closes it. A blur to nothing (a press on a
  // non-focusable spot, or another window) is left to the outside-press check.
  const handleBlur = (event) => {
    const to = event.relatedTarget;
    if (open && to && !event.currentTarget.contains(to)) show('');
  };

  const selection = boxes?.[menuIndex(currentPage)];
  const indicator = nav.shown ? boxes?.[menuIndex(nav.shown)] : null;

  return (
    <header className='site-header'>
      <div className='header-inner'>
        <a
          className='brand'
          href='/'
          aria-label='Westlake High School CS home'
          aria-current={currentPage === 'home' ? 'page' : undefined}
        >
          <span className='brand-name brand-name-full'>Westlake Computer Science Club</span>
          <span className='brand-name brand-name-compact' aria-hidden='true'>Westlake CS Club</span>
        </a>
        <nav
          className='site-nav'
          aria-label='Main navigation'
          ref={navRef}
          onKeyDown={handleKeyDown}
          onBlurCapture={handleBlur}
        >
          <ul className='site-nav-list'>
            {selection && (
              <li
                className='site-nav-selection'
                aria-hidden='true'
                style={{ width: selection.width, transform: `translateX(${selection.left}px)` }}
              />
            )}
            {menus.map(({ value, href, label }) => (
              <li className='site-nav-item' key={value}>
                <a
                  id={triggerId(value)}
                  className='nav-link site-nav-trigger'
                  href={href}
                  aria-current={currentPage === value ? 'page' : undefined}
                  aria-expanded={open === value}
                  aria-controls={open === value ? panelId(value) : undefined}
                  data-state={open === value ? 'open' : 'closed'}
                  onPointerMove={(event) => {
                    if (event.pointerType !== 'mouse' || hovered.current === value) return;
                    hovered.current = value;
                    clearTimeout(timers.current.open);
                    if (open || performance.now() - closedAt.current < SKIP_DELAY) show(value);
                    else timers.current.open = setTimeout(() => show(value), OPEN_DELAY);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType !== 'mouse') return;
                    hovered.current = '';
                    clearTimeout(timers.current.open);
                    if (open) startClose();
                  }}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                    show(open === value ? '' : value);
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          {indicator && (
            <div
              className='site-nav-indicator'
              aria-hidden='true'
              data-state={open ? 'visible' : 'hidden'}
              style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
            >
              <span className='site-nav-arrow' />
            </div>
          )}
          <div className='site-nav-viewport-position'>
            {/* Kept mounted so opening and closing are interruptible CSS transitions.
                Closed and outgoing panels are inert, so only the open panel takes focus. */}
            <div
              ref={viewportRef}
              className='site-nav-viewport'
              data-state={open ? 'open' : 'closed'}
              inert={!open}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') clearTimeout(timers.current.close);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === 'mouse') startClose();
              }}
              onClick={(event) => {
                // Panel links navigate normally, same-page hashes included, and close the
                // panel; modified clicks that open new tabs leave it open.
                if (event.metaKey || event.ctrlKey || event.shiftKey || !event.target.closest('a')) return;
                if (event.currentTarget.contains(document.activeElement)) document.getElementById(triggerId(open))?.focus();
                show('');
              }}
            >
              {menus.map(({ value, Panel }) => {
                const leaving = nav.leaving?.value === value;
                if ((leaving || !open) && (typeof HTMLElement === 'undefined' || !('inert' in HTMLElement.prototype))) return null;
                if (value !== nav.shown && !leaving) return null;
                return (
                  <div
                    key={value}
                    id={panelId(value)}
                    className={`site-nav-panel site-nav-panel-${value}`}
                    data-motion={(leaving ? nav.leaving.motion : nav.motion) || undefined}
                    inert={leaving}
                    onAnimationEnd={leaving
                      ? (event) => {
                          if (event.target !== event.currentTarget) return;
                          setNav((previous) => previous.leaving?.value === value ? { ...previous, leaving: null } : previous);
                        }
                      : undefined}
                  >
                    <Panel />
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
