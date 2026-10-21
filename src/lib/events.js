// Events page filters and row labels, keyed by event.track.
export const eventTracks = [
  { track: 'guest-speaker', label: 'Guest lecture', filterLabel: 'Guest lectures' },
  { track: 'competitive-programming', label: 'Contest', filterLabel: 'Contests' },
  { track: 'hack-club', label: 'Hack Club', filterLabel: 'Hack Club' }
];

export const events = [
  {
    type: 'Guest Speaker',
    track: 'guest-speaker',
    date: '2026-08-31',
    title: 'Transformer architecture with Joseph Zhang',
    speaker: 'Joseph Zhang',
    description:
      "A Westlake alum ('24) and Stanford Math and CS student explains transformer architecture, university research, and life in computer science."
  },
  {
    type: 'Hack Club',
    track: 'hack-club',
    date: null,
    title: 'Build a website from scratch',
    description:
      'Learn the basics of HTML, CSS, and JavaScript with the CS Club officers. Finish the site and get free boba.'
  },
  {
    type: 'Guest Speaker',
    track: 'guest-speaker',
    date: '2026-09-29',
    title: 'Computer architecture and CS at UT',
    speaker: 'Dr. Calvin Lin',
    credential: 'Director of UT Austin’s Turing Scholars Honors Program',
    location: 'Chap Room',
    description:
      'Dr. Calvin Lin shares an expert perspective on computer architecture, university research, and studying computer science at UT Austin.'
  },
  {
    type: 'Guest Speaker',
    track: 'guest-speaker',
    date: '2026-10-19',
    title: 'Quantum computing with HitoMatch',
    speaker: 'Anna White',
    description:
      'Anna White, President of Dikan Quantum Corporation & Executive Director, HitoMatch Foundation, discusses quantum computing and CS education.'
  },
  {
    type: 'Competitive Programming',
    track: 'competitive-programming',
    date: '2026-10-05',
    endDate: '2026-10-11',
    title: 'Code Bash',
    format: 'Online',
    description:
      'This is a FREE Online Programming Contest for High School teams. The Official UIL Computer Science State Contest Directors for Texas put this contest together each year.',
    signupNote: 'Email the officers for signup.',
    link: 'mailto:dz00214@eanesisd.net'
  },
  {
    type: 'Competitive Programming',
    track: 'competitive-programming',
    date: '2026-10-17',
    title: 'Seven Lakes',
    format: 'Online',
    description:
      'A kickoff contest for high school teams, now in its 22nd year. Teams take a written test by apluscompsci, then a 2 hour, 18 question programming round written by the Seven Lakes CS Club.',
    signupNote: 'Email the officers for signup.',
    link: 'mailto:dz00214@eanesisd.net'
  },
  {
    type: 'Competitive Programming',
    track: 'competitive-programming',
    date: '2026-11-21',
    title: 'Clements',
    format: 'Online',
    description:
      'A virtual programming-only competition on Hacker Rank (more details to follow).',
    signupNote: 'Email the officers for signup.',
    link: 'mailto:dz00214@eanesisd.net'
  },
  {
    type: 'Guest Speaker',
    track: 'guest-speaker',
    date: '2026-11-30',
    title: 'An Afternoon with Neo Wang',
    speaker: 'Neo Wang',
    location: 'To be determined - likely chap room.',
    description:
      "Neo Wang, Westlake alum ('22) and generous donor to the CS Club, shares his experience in computer science and life after Westlake. He discusses startups, trading, internships, CS + Math, and other topics. At Westlake, Neo headed the UIL Computer Science team and was a director of the Competitive Programming Initiative, best known for creating the famous USACO training platform usaco.guide.",
    signupNote: 'RSVP here.',
    link: 'https://forms.gle/Zhogm2J19sdz5a7b6'
  },
  {
    type: 'Competitive Programming',
    track: 'competitive-programming',
    date: '2026-12-05',
    title: 'Cy-Woods Computer Science Contests',
    description:
      'A contest by Stacey and the UIL contest writers. Limited availability.'
  },
  {
    type: 'Guest Speaker',
    track: 'guest-speaker',
    date: '2027-01-11',
    title: 'Caring about code in the age of AI',
    speaker: 'Kyle Simpson',
    credential: 'Author of the “You Don’t Know JS” book series',
    description:
      'Kyle Simpson shares his thoughts, and shows some code, from SI: Super(ficial) Intelligence, a recent art and satire project he built.'
  },
  {
    type: 'Competitive Programming',
    track: 'competitive-programming',
    date: '2027-01-16',
    title: 'LASA-Indeed.com UIL Computer Science Contest',
    description:
      'A contest hosted by LASA and Indeed.com.',
    location: 'Indeed.com @ the Domain',
    signupNote: 'Email the officers for signup.'
  }
];

const clubTimeZone = 'America/Chicago';
const utcTimeZone = 'UTC';
const dayFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  timeZone: utcTimeZone
});
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: utcTimeZone
});
const shortMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: utcTimeZone
});
const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  timeZone: utcTimeZone
});
const yearFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  timeZone: utcTimeZone
});

function parseDateKey (dateKey) {
  return new Date(`${dateKey}T12:00:00Z`);
}

const clubDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: clubTimeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

export function getClubDateKey (date) {
  const parts = clubDateFormatter.formatToParts(date);

  const dateParts = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

export function formatEventDate (event) {
  if (event.date === null) {
    return {
      dayLabel: null,
      endDateLabel: null,
      monthLabel: null,
      startDateLabel: 'TBD'
    };
  }

  const startDate = parseDateKey(event.date);
  const startMonth = shortMonthFormatter.format(startDate);
  const startYear = yearFormatter.format(startDate);
  const display = {
    dayLabel: `${weekdayFormatter.format(startDate)}, ${startYear}`,
    endDateLabel: null,
    monthLabel: monthFormatter.format(startDate),
    startDateLabel: `${startMonth} ${dayFormatter.format(startDate)}`
  };

  if (!event.endDate) return display;

  const endDate = parseDateKey(event.endDate);
  const endMonth = shortMonthFormatter.format(endDate);
  const endYear = yearFormatter.format(endDate);
  const isSameMonth = startMonth === endMonth && startYear === endYear;
  const yearLabel =
    startYear === endYear ? startYear : `${startYear}–${endYear}`;

  return {
    ...display,
    dayLabel: `${weekdayFormatter.format(startDate)}–${weekdayFormatter.format(endDate)}, ${yearLabel}`,
    endDateLabel: isSameMonth
      ? dayFormatter.format(endDate)
      : `${endMonth} ${dayFormatter.format(endDate)}`
  };
}

/** Describes when a scheduled event happens relative to the club's current day. */
export function getEventCountdown (event, now = new Date()) {
  const today = getClubDateKey(now);
  if (event.date <= today) return 'Happening now';

  const days = Math.round((parseDateKey(event.date) - parseDateKey(today)) / 86400000);
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

/** Returns every dated event from the club's current day forward. */
export function getScheduledEvents (now = new Date()) {
  const today = getClubDateKey(now);
  return events
    .filter(
      (event) => event.date !== null && (event.endDate ?? event.date) >= today
    )
    .sort((first, second) => first.date.localeCompare(second.date));
}

/** Returns upcoming competitive programming events for the home page Contests section. */
export function getUpcomingContests (now = new Date()) {
  return getScheduledEvents(now).filter(
    (event) => event.track === 'competitive-programming'
  );
}

/** Returns the next two non-contest events; contests have their own homepage section. */
export function getEventPreview (now = new Date()) {
  return getScheduledEvents(now)
    .filter((event) => event.track !== 'competitive-programming')
    .slice(0, 2);
}

/** Returns guest speaker events before the club's current day, newest first. */
export function getPastSpeakers (now = new Date()) {
  const today = getClubDateKey(now);
  return events
    .filter((event) => event.track === 'guest-speaker' && event.date !== null && event.date < today)
    .sort((first, second) => second.date.localeCompare(first.date));
}

/** Returns dated events that ended before the club's current day, most recently ended first. */
export function getPastEvents (now = new Date()) {
  const today = getClubDateKey(now);
  return events
    .filter((event) => event.date !== null && (event.endDate ?? event.date) < today)
    .sort((first, second) =>
      (second.endDate ?? second.date).localeCompare(first.endDate ?? first.date)
    );
}

export function getUnscheduledEvents () {
  return events.filter((event) => event.date === null);
}
