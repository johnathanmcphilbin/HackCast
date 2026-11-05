// Programme copy. Hour tiers are still TBC — change the labels here.
// Placeholder blocks stay in this file. `published` decides what the site shows.

export const episodeRuntime = {
	schedule: 'weekly',
	hosts: '@[host] + @[host]',
	hostsNote: 'TBC',
	confirmed: false
} as const;

/** What approved hours are worth. Not confirmed. */
export const hourTiers = [
	{
		id: 'question',
		channel: 'CH 1',
		label: '5 hrs',
		title: 'send in a question for the show',
		detail: '+ one entry into the prize wheel',
		confirmed: false
	},
	{
		id: 'topic',
		channel: 'CH 2',
		label: '10 hrs',
		title: 'pick a topic for an episode',
		detail: 'you choose what we talk about',
		confirmed: false
	},
	{
		id: 'guest',
		channel: 'CH 3',
		label: '[TBC] hrs',
		title: 'guest spot',
		detail: 'come on hackcast as a guest',
		confirmed: false
	},
	{
		id: 'shop',
		channel: 'MASTER',
		label: 'every hour',
		title: 'shop credit',
		detail: 'every approved hour earns credit to spend in the hackcast shop',
		confirmed: false
	}
] as const;

export const prizeWheel = {
	hoursPerEntry: 5,
	confirmed: false,
	blurb:
		"every 5 approved hours gives you one entry into the prize wheel, spun every episode. what's on the wheel will be announced closer to launch."
} as const;

export const shop = {
	confirmed: false,
	blurb: 'Every approved hour earns shop credit. The shop and its prizes will be announced when they are real.',
	sleeves: [
		{ id: 's1', title: '???', note: 'TBC' },
		{ id: 's2', title: '???', note: 'TBC' },
		{ id: 's3', title: '???', note: 'TBC' },
		{ id: 's4', title: '???', note: 'TBC' },
		{ id: 's5', title: '???', note: 'TBC' },
		{ id: 's6', title: '???', note: 'TBC' }
	]
} as const;

/** EP 01–05. Hidden until titles are real. */
export const episodes = [
	{ id: 'EP 01', title: '[episode title TBA]', status: 'coming soon' },
	{ id: 'EP 02', title: '[episode title TBA]', status: 'coming soon' },
	{ id: 'EP 03', title: '[episode title TBA]', status: 'coming soon' },
	{ id: 'EP 04', title: '[episode title TBA]', status: 'coming soon' },
	{ id: 'EP 05', title: '[episode title TBA]', status: 'coming soon' }
] as const;

/**
 * Flip a flag when that block is real. The landing checks these before rendering
 * hour-tier cards, the prize wheel, shop sleeves, or the episode tracklist.
 */
export const published = {
	hourTiers: false,
	prizeWheel: false,
	shop: false,
	tracklist: false
} as const;

/**
 * The hours → question + wheel mechanic. Said once on the landing page.
 * Hour numbers stay out of the sentence until the question tier is confirmed.
 * When `published.hourTiers` is on, the tier cards replace this sentence.
 */
function hoursToAirtime(): string {
	for (const tier of hourTiers) {
		if (tier.confirmed && tier.id === 'question') {
			return `Every ${tier.label} = a question and a wheel entry.`;
		}
	}
	return 'Approved hours earn a question and a wheel entry.';
}

export const rewardLine = hoursToAirtime();

export const home = {
	tagline: 'a podcast built by teens in tech',
	finale: 'Log the hours. Get on the show.'
} as const;

export const steps = [
	{ n: '01', title: 'build', body: 'Make something you can show.' },
	{ n: '02', title: 'track', body: 'Log the hours you spend.' },
	{ n: '03', title: 'ship', body: 'Send it in. Hours count.' }
] as const;

export type Faq = { id: string; q: string; a: string; tbc?: boolean };

export const faqs: Faq[] = [
	{
		id: 'what',
		q: 'what is hackcast?',
		a: 'A monthly podcast where your voice is heard.'
	},
	{
		id: 'who',
		q: 'who can participate?',
		a: 'Anyone who is 13-18.'
	},
	{
		id: 'build',
		q: 'what can I build?',
		a: 'Websites, games, hardware, anything.'
	},
	{
		id: 'hours',
		q: 'how do I track my hours?',
		a: 'Hackatime for software. Hardware is Lapse and journals every 2 hours in the repo.'
	},
	{
		id: 'shipped',
		q: 'what counts as a shipped project?',
		a: 'A working demo, plus open source code or design.'
	},
	{
		id: 'shop',
		q: 'how do I earn shop rewards?',
		a: 'Shop credits will come in the form of hours.'
	},
	{
		id: 'wheel',
		q: 'how does the prize wheel work?',
		a: 'The wheel will be spun every episode.'
	},
	{
		id: 'airtime',
		q: 'how does someone choose a topic or guest?',
		a: 'You can buy a chance with your hours to ask for a specific guest at HQ.'
	},
	{
		id: 'when',
		q: 'when do new episodes come out?',
		a: 'Hopefully every 2 weeks, if the first one goes well :0'
	}
];

/** The guest builders are asking questions for and racing hours toward. Episodes 1 and 2 have guests already. */
export const nextGuest = {
	episode: 2,
	slug: 'zach-latta',
	name: 'Zach Latta',
	firstName: 'Zach',
	blurb:
		"Hack Club's founder. Ship hours on your HackCast project. Whoever has the most when we lock it gets a question asked on the show for sure."
};

/** The episode builders vote on a guest for: one Hack Club HQ pick and one from outside each. */
export const guestVoteEpisode = 3;
