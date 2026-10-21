import '../ledger.css';
import { eventTracks, formatEventDate, getTitleId } from '../lib/events.js';

export function getTrackLabel (track) {
  return eventTracks.find((entry) => entry.track === track)?.label ?? null;
}

export function EventAction ({ event, className }) {
  if (!event.signupNote) return null;
  if (!event.link) return <p className='ledger-note'>{event.signupNote}</p>;

  return (
    <a className={className} href={event.link} aria-describedby={getTitleId(event)}>
      <span className='ledger-action-label'>{event.signupNote}</span>
      <span className='ledger-action-arrow' aria-hidden='true'>→</span>
    </a>
  );
}

export function LedgerDate ({ date, endDate, startLabel, endLabel }) {
  if (!date) return <p className='ledger-date'>{startLabel}</p>;

  return (
    <p className='ledger-date'>
      <time dateTime={date}>{startLabel}</time>
      {endDate
        ? (
          <>
            <span aria-hidden='true'>–</span>
            <time dateTime={endDate}>
              <span className='sr-only'>through </span>
              {endLabel}
            </time>
          </>
          )
        : null}
    </p>
  );
}

/* Dated ledger row shared by Upcoming events, Contests, and the Events page.
   showType puts the event's track first in the aside, for mixed lists. */
export default function EventItem ({ event, headingLevel = 'h3', showType = true }) {
  const Heading = headingLevel;
  const { startDateLabel, endDateLabel } = formatEventDate(event);
  const kind = showType ? getTrackLabel(event.track) : event.format;
  const details = [
    { label: 'Format', value: showType ? event.format : null },
    { label: 'Location', value: event.location }
  ].filter((detail) => detail.value);

  return (
    <li className='ledger-row'>
      <LedgerDate date={event.date} endDate={event.endDate} startLabel={startDateLabel} endLabel={endDateLabel} />
      <div className='ledger-body'>
        <Heading className='ledger-title' id={getTitleId(event)}>{event.title}</Heading>
        {event.credential ? <p className='ledger-credential'>{event.credential}</p> : null}
        <p className='ledger-description'>{event.description}</p>
        <EventAction event={event} className='ledger-action' />
      </div>
      {kind || details.length > 0
        ? (
          <p className='ledger-aside'>
            {kind ? <span>{kind}</span> : null}
            {details.map((detail) => (
              <span className='ledger-aside-secondary' key={detail.label}>
                <span className='sr-only'>{detail.label}: </span>
                {detail.value}
              </span>
            ))}
          </p>
          )
        : null}
    </li>
  );
}
