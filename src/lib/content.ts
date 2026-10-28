// Copy for the site. Anything still being decided says so in the answer.

export const steps = [
	{
		n: '01',
		title: 'Build',
		body: 'Make a project. A website, a game, an app, hardware, a tool — if you can finish it, it counts.'
	},
	{
		n: '02',
		title: 'Ship',
		body: 'Track your time, share your progress, and submit the project.'
	},
	{
		n: '03',
		title: 'Earn',
		body: 'Approved hours become credit for the Hackcast shop.'
	},
	{
		n: '04',
		title: 'Run the show',
		body: 'Spend those hours on the podcast: a question, a prize-wheel entry, or — if you shipped the most that week — the topic or the guest.'
	}
] as const;

export const fiveRate = {
	title: 'Five approved hours. A question, and a spin.',
	body: 'Send one question to the podcast, and take one entry on that week’s prize wheel. The wheel is spun on the show.'
} as const;

export const hourRate = {
	label: '1 approved hour',
	title: 'Shop credit',
	body: 'Every approved hour you spend building earns credit for the Hackcast shop.'
} as const;

export const weekRate = {
	label: 'Most hours that week',
	title: 'The topic, or the guest',
	body: 'Whoever ships the most approved hours picks a topic or nominates a guest for a later episode. We’ll get in touch to plan it.'
} as const;

export const shopEmpty = 'Nothing is on the shelf yet. Prizes get announced on the show.';

export const segments = [
	{ cue: 'A', title: 'Intros & updates', body: 'Who’s on, and what got shipped.' },
	{ cue: 'B', title: 'Main discussion', body: 'The week’s topic. Sometimes a guest.' },
	{ cue: 'C', title: 'Meta', body: 'What’s going on in Hack Club.' },
	{ cue: 'D', title: 'Games & rapid-fire', body: 'Short questions. No time to hedge.' },
	{ cue: 'E', title: 'Your questions', body: 'Sent in by people building with Hackcast.' }
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
		a: 'A weekly podcast by teenagers, 25–40 minutes long, and a Hack Club You Ship, We Ship programme. You build projects, log hours, earn shop rewards, and get a say in the show.'
	},
	{
		q: 'Who can participate?',
		a: 'Teenagers. Full eligibility details will be posted here before launch.'
	},
	{
		q: 'What can I build?',
		a: 'Websites, games, apps, hardware, tools, bots, art projects. If you made it, it counts.'
	},
	{
		q: 'How do I track my hours?',
		a: 'The time-tracking setup isn’t final. Instructions will be on this page and in your signup email before hours start counting.'
	},
	{
		q: 'What counts as a shipped project?',
		a: 'The checklist is still being written. It will be posted here before launch.'
	},
	{
		q: 'Can I work on an existing project?',
		a: 'Not decided yet. This answer will be updated before launch.'
	},
	{
		q: 'How do I earn shop rewards?',
		a: 'Every approved hour you spend building earns shop credit. What’s in the shop will be announced on the show.'
	},
	{
		q: 'How does the weekly prize wheel work?',
		a: 'Every 5 approved hours is one entry. The wheel is spun on the show. Prizes will be announced closer to launch.'
	},
	{
		q: 'How does someone choose a podcast topic or guest?',
		a: 'Each week, whoever ships the most approved hours picks a topic or nominates a guest for a later episode. We’ll get in touch to plan it.'
	},
	{
		q: 'When do new episodes come out?',
		a: 'Every week. The release day will be announced with the first episode.'
	}
];

export type ShopPrize = { name: string; image: string; alt: string };

/** Physical shop prizes. Leave empty until they’re announced — the page says so instead of showing blank slots. */
export const shopPrizes: ShopPrize[] = [];
