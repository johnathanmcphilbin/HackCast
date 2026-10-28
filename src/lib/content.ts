// Programme copy. Hour tiers are still TBC — change the labels here.
// The landing-station art uses these same words.

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

export const steps = [
	{
		n: '01',
		title: 'build',
		body: 'websites, games, apps, hardware, tools, or anything else you can imagine.'
	},
	{
		n: '02',
		title: 'track',
		body: 'track your time and share your progress as you go.'
	},
	{
		n: '03',
		title: 'ship',
		body: 'submit your project. every approved hour lands on the clock.'
	}
] as const;

export type Faq = { id: string; q: string; a: string; tbc?: boolean };

export const faqs: Faq[] = [
	{
		id: 'what',
		q: 'what is hackcast?',
		a: 'hackcast is a weekly, 25–40 minute podcast by teenagers, and a Hack Club You Ship, We Ship programme. you build projects, log your hours, earn shop rewards and get a say in what happens on the show.'
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
		a: 'every approved hour you spend building earns shop credit. the shop and its prizes will be announced soon.'
	},
	{
		id: 'wheel',
		q: 'how does the weekly prize wheel work?',
		a: prizeWheel.blurb
	},
	{
		id: 'airtime',
		q: 'how does someone choose a topic or guest?',
		a: 'about 10 approved hours lets you pitch a topic. a guest spot takes more. that number is still TBC.',
		tbc: true
	},
	{
		id: 'when',
		q: 'when do new episodes come out?',
		a: 'every week. the release day will be announced with the first episode.'
	}
];
