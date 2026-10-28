// Programme copy. Hour tiers are still TBC — change the labels here.
// Placeholder blocks stay in this file. `published` decides what the site shows.

export const episodeRuntime = {
	label: '25–40 min',
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
		detail: '+ one entry into the weekly prize wheel',
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
		"every 5 approved hours gives you one entry into that week's prize wheel, spun live on the show. what's on the wheel will be announced closer to launch."
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
	return 'Approved hours earn a question on the show and an entry on the prize wheel. The hour counts will be posted before launch.';
}

export const rewardLine = hoursToAirtime();

export const home = {
	lede: 'Build stuff, log hours, get on a teen podcast.',
	howIntro:
		'Hackcast is a Hack Club You Ship, We Ship programme, and a weekly podcast made by teenagers. You ship projects. We ship the show. The hours you spend building are how you get on it.',
	who: 'It is for teenagers. You do not need a famous project, and you do not need to have been on a podcast. If you like making things, this is for you. Full eligibility rules will be posted before launch.',
	showTitle: 'Teenagers. Mics. Opinions.',
	show: [
		'Hackcast is a weekly podcast. Episodes run 25 to 40 minutes. Hosts sit down with teenagers and talk about technology, the things people are building, Hack Club, internet culture, and the arguments the community is in the middle of.',
		'A show usually moves through intros and what just got shipped, one main topic, a pass through the Hack Club community, and a short rapid-fire round. Questions sent in by people who are building are read on air, with a shoutout.',
		'The conversations stay specific. A week might be a game someone finished, a hardware bug that took all weekend, a debate about whether a tool is worth the hype, or a story from a club meeting. The hosts are teenagers too. Their names go up before episode one.',
		'New episodes come out every week. The release day will be announced with the first episode.'
	],
	finaleTitle: "You're on air.",
	finale:
		'Build something, log the hours, and your name can end up on the show. Joining puts your name on the list. When the form opens, we email you how to start, how to log hours, and when episode one is coming.'
} as const;

export const steps = [
	{
		n: '01',
		title: 'build',
		body: 'Websites, games, apps, hardware, tools, bots, art projects. If you made it, it counts as building. Start something new, or keep going on a project you already care about. The work can be messy. It just has to be yours.'
	},
	{
		n: '02',
		title: 'track',
		body: 'Keep a record of the time you spend and share your progress as you go. The tracker is still being finished. Instructions will be on this site and in your signup email before any hours start counting, so nothing you do before that gets lost in the fine print.'
	},
	{
		n: '03',
		title: 'ship',
		body: 'Submit the project when it is ready. Every approved hour is written onto your record, and that record is what the show uses when it is time to put someone on air.'
	}
] as const;

export type Faq = { id: string; q: string; a: string; tbc?: boolean };

export const faqs: Faq[] = [
	{
		id: 'what',
		q: 'what is hackcast?',
		a: 'hackcast is a weekly, 25–40 minute podcast by teenagers, and a Hack Club You Ship, We Ship programme. you build projects, log your hours, and get a say in what happens on the show.'
	},
	{
		id: 'who',
		q: 'who can participate?',
		a: 'hackcast is for teenagers. full eligibility details will be posted here before launch.'
	},
	{
		id: 'build',
		q: 'what can I build?',
		a: 'pretty much anything: websites, games, apps, hardware, tools, bots, art projects. if you made it, it counts as building.'
	},
	{
		id: 'hours',
		q: 'how do I track my hours?',
		a: "we're finalising the time-tracking setup. exact instructions will be on this page and in your signup email before hours start counting.",
		tbc: true
	},
	{
		id: 'shipped',
		q: 'what counts as a shipped project?',
		a: 'the shipping checklist is still being written. it will be posted here before launch.',
		tbc: true
	},
	{
		id: 'existing',
		q: 'can I work on an existing project?',
		a: "the rules for existing projects haven't been finalised yet. we'll update this answer before launch.",
		tbc: true
	},
	{
		id: 'shop',
		q: 'how do I earn shop rewards?',
		a: shop.confirmed
			? shop.blurb
			: 'the shop is not open yet. how credit works will be posted here before anything goes on sale.',
		tbc: !shop.confirmed
	},
	{
		id: 'wheel',
		q: 'how does the weekly prize wheel work?',
		a: published.prizeWheel
			? prizeWheel.blurb
			: 'the wheel will be spun live on the show. entries and prizes will be posted before launch.',
		tbc: !published.prizeWheel
	},
	{
		id: 'airtime',
		q: 'how does someone choose a topic or guest?',
		a: 'pitching a topic or coming on as a guest both take approved hours. those counts are still being set, and they will be posted before launch.',
		tbc: true
	},
	{
		id: 'when',
		q: 'when do new episodes come out?',
		a: 'every week. the release day will be announced with the first episode.'
	}
];
