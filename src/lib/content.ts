// Copy for the landing page. Anything marked TBD is waiting on final programme rules.

export const steps = [
	{
		n: '01',
		title: 'Build',
		body: 'Make whatever you want. Websites, games, apps, hardware projects, tools or anything else you can imagine.',
		note: 'literally anything'
	},
	{
		n: '02',
		title: 'Ship',
		body: 'Track your time, share your progress and submit your projects.',
		note: 'show your work!'
	},
	{
		n: '03',
		title: 'Earn',
		body: 'Earn shop rewards for every approved hour spent building.',
		note: 'hours → prizes'
	},
	{
		n: '04',
		title: 'Run the Show',
		body: 'Submit questions, enter weekly prize draws and help decide what happens on Hackcast.',
		note: "you're on air"
	}
] as const;

export const segments = [
	{ cue: 'A', title: 'Intros & updates', body: "Who's on, what's new, what got shipped this week." },
	{ cue: 'B', title: 'Main discussion & guests', body: 'The big topic of the week, sometimes with a guest.' },
	{ cue: 'C', title: 'Meta', body: "What's happening in the Hack Club community right now." },
	{ cue: 'D', title: 'Games & rapid-fire', body: 'Quick questions, hot takes, no time to think.' },
	{ cue: 'E', title: 'Your questions', body: 'Questions sent in by people building with Hackcast.' }
] as const;

export const topics = [
	'technology',
	'building projects',
	'Hack Club',
	'internet culture',
	'community debates'
] as const;

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
	{
		q: 'What is Hackcast?',
		a: 'Hackcast is a weekly, 25–40 minute podcast by teenagers, and a Hack Club You Ship, We Ship programme. You build projects, log your hours, earn shop rewards and get a say in what happens on the show.'
	},
	{
		q: 'Who can participate?',
		a: 'Hackcast is for teenagers. Full eligibility details will be posted here before launch.'
	},
	{
		q: 'What can I build?',
		a: 'Pretty much anything: websites, games, apps, hardware, tools, bots, art projects. If you made it, it counts as building.'
	},
	{
		q: 'How do I track my hours?',
		a: "We're finalising the time-tracking setup. Exact instructions will be on this page and in your signup email before hours start counting."
	},
	{
		q: 'What counts as a shipped project?',
		a: 'The shipping checklist is still being written. It will be posted here before launch.'
	},
	{
		q: 'Can I work on an existing project?',
		a: "The rules for existing projects haven't been finalised yet. We'll update this answer before launch."
	},
	{
		q: 'How do I earn shop rewards?',
		a: 'Every approved hour you spend building earns shop credit. The shop and its prizes will be announced soon.'
	},
	{
		q: 'How does the weekly prize wheel work?',
		a: "Every 5 approved hours gives you one entry into that week's prize wheel, which is spun on the show. What's on the wheel will be announced closer to launch."
	},
	{
		q: 'How does someone choose a podcast topic or guest?',
		a: 'Each week, whoever ships the most approved hours gets to choose a topic or nominate a guest for a future episode. We’ll get in touch to plan it with you.'
	},
	{
		q: 'When do new episodes come out?',
		a: 'Every week. The release day will be announced alongside the first episode.'
	}
];

export type ShopPrize = { name: string; image: string; alt: string };

/** Physical shop prizes for the Rewards "shelf". Empty slots render as placeholders until these are filled in. */
export const shopPrizes: ShopPrize[] = [];
