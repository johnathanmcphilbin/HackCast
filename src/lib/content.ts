// Copy and the numbers that are still placeholders.
// Hour tiers and the episode runtime are not confirmed. Change them here.

export const episodeRuntime = {
	label: '25–40 min',
	schedule: 'Weekly',
	hosts: 'Teenagers',
	channel: 'CH-01',
	/** Not locked. The release day is announced with episode 01. */
	confirmed: false
} as const;

export const ageRange = '13–18';

const questionHours = 5;
const topicHours = 10;

/** What approved hours buy on the show. Not confirmed. */
export const hourTiers = [
	{
		id: 'question',
		hours: questionHours,
		label: `~${questionHours} hrs`,
		action: 'Ask the hosts a question',
		confirmed: false
	},
	{
		id: 'topic',
		hours: topicHours,
		label: `~${topicHours} hrs`,
		action: 'Pitch a whole topic',
		confirmed: false
	},
	{
		id: 'guest',
		hours: null as number | null,
		label: 'Guest spot',
		action: 'Hours TBC',
		confirmed: false
	}
] as const;

const wheelHours = 5;

/** One prize-wheel entry per this many approved hours. Not confirmed. */
export const prizeWheel = {
	hoursPerEntry: wheelHours,
	confirmed: false,
	blurb: `Every ${wheelHours} approved hours earns one entry. The wheel is spun live on the show.`
} as const;

export const hero = {
	kicker: `A Hack Club YSWS programme · Ages ${ageRange}`,
	lede: 'Hackcast is a weekly podcast made by teens and powered by the things you build. Ship projects, earn shop rewards, and help decide what goes on air.'
} as const;

export const steps = [
	{
		n: '01',
		title: 'Build',
		body: 'Make whatever you want: websites, games, apps, hardware, tools.'
	},
	{
		n: '02',
		title: 'Ship',
		body: 'Track your time, share your progress and submit your project.'
	},
	{
		n: '03',
		title: 'Earn',
		body: 'Earn shop rewards for every approved hour you spend building.'
	},
	{
		n: '04',
		title: 'Run the show',
		body: 'Spend your hours on air: ask questions, pitch topics, land a guest spot.'
	}
] as const;

export const shopLine = 'Every approved hour earns shop credit for the Hackcast shop.';

export const segments = [
	{ cue: 'A', title: 'Intros & updates' },
	{ cue: 'B', title: 'Main discussion & guests' },
	{ cue: 'C', title: "Meta: what's happening in Hack Club" },
	{ cue: 'D', title: 'Games & rapid-fire' },
	{ cue: 'E', title: 'Your questions' }
] as const;

export const showBlurb =
	'A weekly 25–40 minute podcast about technology, building projects, Hack Club, internet culture and community debates.';

export const questionExample = {
	quote: "What's the most cursed thing you've ever shipped, and would you ship it again?",
	from: '@you',
	hours: questionHours
} as const;

export const questionSteps = [
	{ n: '01', title: `Log ~${questionHours} approved hours` },
	{ n: '02', title: 'Send in your question' },
	{ n: '03', title: 'Hear it on Hackcast' }
] as const;

export const joinPerks = [
	{ n: '01', text: 'Build anything' },
	{ n: '02', text: 'Shop rewards for every approved hour' },
	{
		n: '03',
		text: `Spend hours on air: ~${questionHours} for a question, ~${topicHours} for a whole topic`
	}
] as const;

export const cta = {
	lede: 'Join Hackcast, start building, and turn your hours into rewards and a say in the show.'
} as const;

export type Faq = {
	id: string;
	q: string;
	a: string;
	/** Shown as an acid status tag. The answer is still a placeholder. */
	tbc?: boolean;
	/** Included in the landing-page preview. */
	preview?: boolean;
};

export const faqs: Faq[] = [
	{
		id: 'what',
		q: 'What is Hackcast?',
		a: `A weekly, ${episodeRuntime.label} podcast made by teenagers, and a Hack Club You Ship, We Ship programme. Build projects, log hours, earn shop rewards and get a say in the show.`,
		preview: true
	},
	{
		id: 'who',
		q: 'Who can participate?',
		a: `Teenagers, ages ${ageRange}. Full eligibility details will be posted here before launch.`,
		preview: true
	},
	{
		id: 'build',
		q: 'What can I build?',
		a: 'Websites, games, apps, hardware, tools, bots, art. If you made it, it counts.',
		preview: true
	},
	{
		id: 'hours',
		q: 'How do I track my hours?',
		a: "We're still setting up time tracking. Instructions will be on this page, and in the signup email, before hours start counting.",
		tbc: true
	},
	{
		id: 'shipped',
		q: 'What counts as shipped?',
		a: "The shipping checklist isn't written yet. It goes up here before launch.",
		tbc: true
	},
	{
		id: 'existing',
		q: "Can I use a project I've already started?",
		a: "Not decided yet. We'll update this answer before launch.",
		tbc: true
	},
	{
		id: 'shop',
		q: 'How do shop rewards work?',
		a: 'Every approved hour earns shop credit. The full shop is announced before launch.',
		preview: true
	},
	{
		id: 'wheel',
		q: 'How does the prize wheel work?',
		a: prizeWheel.blurb
	},
	{
		id: 'airtime',
		q: 'How do I get a topic or guest on the show?',
		a: `About ${topicHours} approved hours lets you pitch a whole topic. A guest spot takes more. That number is still TBC.`
	},
	{
		id: 'when',
		q: 'When do episodes come out?',
		a: 'Weekly. Release day to be announced.'
	}
];

export const faqPreview = faqs.filter((item) => item.preview);

export type ShopPrize = { name: string; image: string; alt: string };

/** Physical shop prizes. Empty slots render as "Prize [TBA]". */
export const shopPrizes: ShopPrize[] = [];

export const shopSlotCount = 4;
