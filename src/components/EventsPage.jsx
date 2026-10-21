import { useState } from 'react';
import '../events.css';
import { EventAction, LedgerDate, getTrackLabel } from './EventItem.jsx';
import {
  eventTracks,
  formatEventDate,
  getEventCountdown,
  getPastEvents,
  getScheduledEvents,
  getTitleId,
  getUnscheduledEvents
} from '../lib/events.js';
import { useEventDate } from '../lib/event-clock.jsx';

const filters = [{ track: 'all', filterLabel: 'All' }, ...eventTracks];

/* The first upcoming row is the next event: a larger title and a countdown under its date. */
function UpcomingEvent ({ event, countdown }) {
  const { startDateLabel, endDateLabel, weekdayLabel } = formatEventDate(event);
  const details = [getTrackLabel(event.track), event.format, event.location].filter(Boolean);

  return (
    <li className={countdown ? 'events-row is-next' : 'events-row'}>
      <div className='events-when'>
        <LedgerDate date={event.date} endDate={event.endDate} startLabel={startDateLabel} endLabel={endDateLabel} />
        {weekdayLabel ? <p className='events-weekday'>{weekdayLabel}</p> : null}
        {countdown ? <p className='events-countdown'>{countdown}</p> : null}
      </div>
      <div className='events-body'>
        <h3 className='events-title' id={getTitleId(event)}>{event.title}</h3>
        {event.credential ? <p className='ledger-credential'>{event.credential}</p> : null}
        <p className='events-description'>{event.description}</p>
        <p className='events-details'>{details.join(' · ')}</p>
        <EventAction event={event} className='ledger-action' />
      </div>
    </li>
  );
}

function PastEvent ({ event }) {
  const { startDateLabel, endDateLabel } = formatEventDate(event);

  return (
    <li className='ledger-row events-past-row'>
      <LedgerDate date={event.date} endDate={event.endDate} startLabel={startDateLabel} endLabel={endDateLabel} />
      <h3 className='events-past-title' id={getTitleId(event)}>{event.title}</h3>
      <p className='ledger-aside'>{getTrackLabel(event.track)}</p>
    </li>
  );
}

export default function EventsPage () {
  const now = useEventDate();
  const [track, setTrack] = useState('all');
  const matches = (event) => track === 'all' || event.track === track;
  const upcoming = [...getScheduledEvents(now), ...getUnscheduledEvents()].filter(matches);
  const pastEvents = getPastEvents(now).filter(matches);

  return (
    <main className='events-main' id='events-content'>
      <section className='section-shell events-page-section' aria-labelledby='events-heading'>
        <div className='section-inner section-stack'>
          <div className='split-heading'>
            <h1 className='section-heading' id='events-heading'>Events.</h1>
            <p className='section-intro'>
              Guest lectures, contests, and build sessions, on top of regular meetings
              every Monday from 4:30 to 5:30 in Room 291A.
            </p>
          </div>

          <section className='events-block' aria-labelledby='upcoming-heading'>
            <div className='events-block-heading'>
              <h2 className='events-block-title' id='upcoming-heading'>Upcoming</h2>
              <div className='events-filters' role='group' aria-label='Show events by type'>
                {filters.map((filter) => (
                  <button
                    className='events-filter'
                    type='button'
                    aria-pressed={track === filter.track}
                    onClick={() => setTrack(filter.track)}
                    key={filter.track}
                  >
                    {filter.filterLabel}
                  </button>
                ))}
              </div>
            </div>
            {upcoming.length > 0
              ? (
                <ol className='events-list'>
                  {upcoming.map((event, index) => (
                    <UpcomingEvent
                      event={event}
                      countdown={index === 0 && event.date ? getEventCountdown(event, now) : null}
                      key={`${event.date}-${event.title}`}
                    />
                  ))}
                </ol>
                )
              : (
                <p className='events-empty'>
                  {track === 'all'
                    ? 'Nothing is on the calendar yet.'
                    : 'Nothing of this type is on the calendar yet.'}
                  {' '}Check back after the next club meeting.
                </p>
                )}
          </section>

          {pastEvents.length > 0
            ? (
              <section className='events-block' aria-labelledby='past-events-heading'>
                <h2 className='events-block-title' id='past-events-heading'>Past events</h2>
                <ol className='ledger'>
                  {pastEvents.map((event) => (
                    <PastEvent event={event} key={`${event.date}-${event.title}`} />
                  ))}
                </ol>
              </section>
              )
            : null}
        </div>
      </section>
    </main>
  );
}
