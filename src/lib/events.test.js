import assert from 'node:assert/strict';
import test from 'node:test';
import {
  eventTracks,
  events,
  formatEventDate,
  getClubDateKey,
  getEventCountdown,
  getEventPreview,
  getPastEvents,
  getPastSpeakers,
  getScheduledEvents,
  getUpcomingContests,
  getUnscheduledEvents
} from './events.js';

test('shared event snapshots change at club midnight, including daylight saving time', () => {
  assert.equal(getClubDateKey(new Date('2026-10-04T04:59:59Z')), '2026-10-03');
  assert.equal(getClubDateKey(new Date('2026-10-04T05:00:00Z')), '2026-10-04');
  assert.equal(getClubDateKey(new Date('2026-11-01T06:30:00Z')), '2026-11-01');
  assert.equal(getClubDateKey(new Date('2026-11-01T07:30:00Z')), '2026-11-01');
});

test('keeps events scheduled for today in the club timezone', () => {
  const eventTitles = getEventPreview(new Date('2026-09-30T04:59:59Z')).map(
    ({ title }) => title
  );

  assert.deepEqual(eventTitles, [
    'Computer architecture and CS at UT',
    'Quantum computing with HitoMatch'
  ]);
});

test('drops an event when the next club calendar day starts', () => {
  const eventTitles = getEventPreview(new Date('2026-09-30T05:00:00Z')).map(
    ({ title }) => title
  );

  assert.deepEqual(eventTitles, [
    'Quantum computing with HitoMatch',
    'An Afternoon with Neo Wang'
  ]);
});

test('keeps a multi-day competition upcoming through its final day', () => {
  const eventTitles = getScheduledEvents(new Date('2026-10-12T04:59:59Z')).map(
    ({ title }) => title
  );

  assert.deepEqual(eventTitles, [
    'Code Bash',
    'Seven Lakes',
    'Quantum computing with HitoMatch',
    'Clements',
    'An Afternoon with Neo Wang',
    'Cy-Woods Computer Science Contests',
    'Caring about code in the age of AI',
    'LASA-Indeed.com UIL Computer Science Contest'
  ]);
});

test('derives the display labels for a multi-day event from its canonical dates', () => {
  const codeBash = events.find(({ title }) => title === 'Code Bash');

  assert.deepEqual(formatEventDate(codeBash), {
    endDateLabel: '11',
    startDateLabel: 'Oct 05',
    weekdayLabel: 'Monday–Sunday'
  });
});

test('drops a multi-day competition on the next club calendar day', () => {
  const eventTitles = getScheduledEvents(new Date('2026-10-12T05:00:00Z')).map(
    ({ title }) => title
  );

  assert.deepEqual(eventTitles, [
    'Seven Lakes',
    'Quantum computing with HitoMatch',
    'Clements',
    'An Afternoon with Neo Wang',
    'Cy-Woods Computer Science Contests',
    'Caring about code in the age of AI',
    'LASA-Indeed.com UIL Computer Science Contest'
  ]);
});

test('keeps unscheduled events separate from the dated schedule', () => {
  const eventTitles = getUnscheduledEvents().map(({ title }) => title);

  assert.deepEqual(eventTitles, ['Build a website from scratch']);
});

test('leaves contests out of the homepage preview after Clements', () => {
  const eventTitles = getEventPreview(new Date('2026-11-22T12:00:00Z')).map(
    ({ title }) => title
  );

  assert.deepEqual(eventTitles, ['An Afternoon with Neo Wang', 'Caring about code in the age of AI']);
});

test('keeps the December contest through club midnight', () => {
  const now = new Date('2026-12-06T05:59:59Z');
  const contests = getUpcomingContests(now);

  assert.deepEqual(contests.map(({ title }) => title), ['Cy-Woods Computer Science Contests', 'LASA-Indeed.com UIL Computer Science Contest']);
  assert.deepEqual(getEventPreview(now).map(({ title }) => title), ['Caring about code in the age of AI']);
  assert.equal(contests[0].date, '2026-12-05');
  assert.match(contests[0].description, /Stacey and the UIL contest writers/);
  assert.match(contests[0].description, /Limited availability/);
  assert.deepEqual(formatEventDate(contests[0]), {
    endDateLabel: null,
    startDateLabel: 'Dec 05',
    weekdayLabel: 'Saturday'
  });
  assert.deepEqual(
    getUpcomingContests(new Date('2026-12-06T06:00:00Z')).map(({ title }) => title),
    ['LASA-Indeed.com UIL Computer Science Contest']
  );
});

test('returns no homepage events after every scheduled event has passed', () => {
  const titles = (now) => getEventPreview(new Date(now)).map(({ title }) => title);

  assert.deepEqual(titles('2027-01-12T05:59:59Z'), ['Caring about code in the age of AI']);
  assert.deepEqual(titles('2027-01-12T06:00:00Z'), []);
});

test('keeps the latest schedule addition, reschedule and cancellation', () => {
  assert.equal(
    events.find((e) => e.title === 'Quantum computing with HitoMatch').date,
    '2026-10-19'
  );
  assert.equal(
    events.find((e) => e.title === 'Build a website from scratch').date,
    null
  );
  assert.ok(
    !events.some((e) => e.title === 'Inside the Turing Scholars program')
  );
});

test('lists past guest speakers newest first and keeps today\'s talk upcoming', () => {
  const titles = (now) => getPastSpeakers(new Date(now)).map(({ title }) => title);

  assert.deepEqual(titles('2026-10-19T17:00:00Z'), [
    'Computer architecture and CS at UT',
    'Transformer architecture with Joseph Zhang'
  ]);
  assert.deepEqual(titles('2026-10-20T05:00:00Z'), [
    'Quantum computing with HitoMatch',
    'Computer architecture and CS at UT',
    'Transformer architecture with Joseph Zhang'
  ]);
  assert.deepEqual(titles('2026-08-01T17:00:00Z'), []);
});

test('archives every finished event newest first and keeps multi-day events until they end', () => {
  const titles = (now) => getPastEvents(new Date(now)).map(({ title }) => title);

  assert.deepEqual(titles('2026-10-11T12:00:00Z'), [
    'Computer architecture and CS at UT',
    'Transformer architecture with Joseph Zhang'
  ]);
  assert.deepEqual(titles('2026-10-12T05:00:00Z').slice(0, 2), [
    'Code Bash',
    'Computer architecture and CS at UT'
  ]);
  assert.deepEqual(titles('2026-08-30T12:00:00Z'), []);
  assert.ok(!titles('2027-01-01T12:00:00Z').includes('Build a website from scratch'));
});

test('labels every event track used by the Events page filters', () => {
  const labelled = new Set(eventTracks.map(({ track }) => track));

  for (const event of events) assert.ok(labelled.has(event.track), event.title);
});

test('counts down to the next event in club days and marks running events', () => {
  const sevenLakes = events.find(({ title }) => title === 'Seven Lakes');
  const codeBash = events.find(({ title }) => title === 'Code Bash');

  assert.equal(getEventCountdown(sevenLakes, new Date('2026-10-13T18:00:00Z')), 'In 4 days');
  assert.equal(getEventCountdown(sevenLakes, new Date('2026-10-17T04:59:59Z')), 'Tomorrow');
  assert.equal(getEventCountdown(sevenLakes, new Date('2026-10-17T05:00:00Z')), 'Happening now');
  assert.equal(getEventCountdown(codeBash, new Date('2026-10-08T12:00:00Z')), 'Happening now');
  assert.equal(getEventCountdown(sevenLakes, new Date('2026-09-17T12:00:00Z')), 'In 30 days');
});
