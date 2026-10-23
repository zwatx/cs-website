import rosierPhoto from '../../assets/sponsors/lynden-rosier.webp';
import neoPhoto from '../../assets/sponsors/neo-wang.webp';
import kylePhoto from '../../assets/sponsors/kyle-simpson.webp';
import cleanshotLogo from '../../assets/sponsors/cleanshot.svg';

// People show a photo (or their initials) with a short bio and an optional website; organizations show a logo and name.
// { kind: 'company', name: 'Acme', logo: acmeLogo, href: 'https://acme.com' }
const sponsors = [
  {
    kind: 'person',
    name: 'Lynden Rosier',
    role: 'Computer Science teacher, Westlake High School',
    photo: rosierPhoto,
    photoSize: 186,
    bio: 'Mr. Rosier has taught for more than 40 years, 37 of them in computer science. He holds a math degree from Michigan State and a computer science degree from UT Dallas, worked at Texas Instruments, and has coached three UIL Computer Science teams to the State Meet.'
  },
  {
    kind: 'person',
    name: 'Neo Wang',
    role: 'Westlake alum (’22), Turing Scholar at UT Austin',
    photo: neoPhoto,
    photoSize: 480,
    href: 'https://nwatx.me/',
    bio: 'Neo led Westlake’s UIL Computer Science team and, as a director at the Competitive Programming Initiative, helped build the USACO Guide. He now studies computer science and math at UT Austin, writes problems for the UT Programming Contest, and has interned at Roblox and DRW.'
  },
  {
    kind: 'person',
    name: 'Kyle Simpson',
    role: 'Software engineer, author of “You Don’t Know JS”',
    photo: kylePhoto,
    photoSize: 440,
    href: 'https://me.getify.com/',
    bio: 'Kyle Simpson is a web-oriented software engineer, widely acclaimed for his “You Don’t Know JS” book series and nearly 1M hours viewed of his online courses. Kyle’s superpower is asking better questions, and he deeply believes in maximally using the minimally-necessary tools for any task. As a “human-centric technologist”, he’s passionate about bringing humans and technology together, evolving engineering organizations towards solving the right problems, in simpler ways. Kyle will always fight for the people behind the pixels.'
  },
  {
    kind: 'company',
    name: 'CleanShot',
    logo: cleanshotLogo,
    href: 'https://cleanshot.com/'
  }
];

function getInitials (name) {
  return name.split(' ').map((part) => part[0]).join('');
}

function PersonSponsor ({ sponsor }) {
  return (
    <li className='sponsor-person'>
      {sponsor.photo
        ? (
          <img
            className='sponsor-photo'
            src={sponsor.photo}
            alt=''
            width={sponsor.photoSize}
            height={sponsor.photoSize}
            loading='lazy'
            decoding='async'
          />
          )
        : <span className='sponsor-photo sponsor-initials' aria-hidden='true'>{getInitials(sponsor.name)}</span>}
      <div>
        <h4 className='sponsor-name'>{sponsor.name}</h4>
        <p className='sponsor-role'>{sponsor.role}</p>
        <p className='sponsor-bio'>{sponsor.bio}</p>
        {sponsor.href
          ? (
            <a className='text-action sponsor-website' href={sponsor.href} target='_blank' rel='noreferrer'>
              {new URL(sponsor.href).hostname}
              <span className='action-arrow' aria-hidden='true'>↗</span>
            </a>
            )
          : null}
      </div>
    </li>
  );
}

function CompanySponsor ({ sponsor }) {
  const content = (
    <>
      {sponsor.logo
        ? <img className='sponsor-logo' src={sponsor.logo} alt='' loading='lazy' decoding='async' />
        : null}
      <span className='sponsor-name'>{sponsor.name}</span>
    </>
  );

  return (
    <li className='sponsor'>
      {sponsor.href
        ? <a className='sponsor-link' href={sponsor.href} target='_blank' rel='noreferrer'>{content}</a>
        : content}
    </li>
  );
}

export default function SponsorsSection () {
  const people = sponsors.filter((sponsor) => sponsor.kind === 'person');
  const companies = sponsors.filter((sponsor) => sponsor.kind === 'company');

  return (
    <section
      className='section-shell sponsors-section'
      id='sponsors'
      aria-labelledby='sponsors-heading'
    >
      <div className='section-inner section-stack'>
        <div className='split-heading'>
          <h2 className='section-heading' id='sponsors-heading'>
            Sponsors.
          </h2>
          <p className='section-intro'>
            The people and organizations who back the club’s contests, guest lectures,
            and events.
          </p>
        </div>
        {people.length > 0
          ? (
            <div>
              <h3 className='sponsor-group-heading'>People</h3>
              <ul className='sponsor-people'>
                {people.map((sponsor) => <PersonSponsor key={sponsor.name} sponsor={sponsor} />)}
              </ul>
            </div>
            )
          : null}
        {companies.length > 0
          ? (
            <div>
              <h3 className='sponsor-group-heading'>Organizations</h3>
              <ul className='sponsor-grid'>
                {companies.map((sponsor) => <CompanySponsor key={sponsor.name} sponsor={sponsor} />)}
              </ul>
            </div>
            )
          : null}
      </div>
    </section>
  );
}
