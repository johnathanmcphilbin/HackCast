/**
 * HackCast shop catalog. Hours come off approved submission time.
 * Dollar grants stay behind "See grant amount" in the UI.
 * The hour-race question is a status, not a SKU.
 */

export const redemptionStatuses = ['pending', 'approved', 'fulfilled', 'rejected'] as const;
export type RedemptionStatus = (typeof redemptionStatuses)[number];

export function isRedemptionStatus(value: string): value is RedemptionStatus {
	return (redemptionStatuses as readonly string[]).includes(value);
}

export type ShopKind = 'credit' | 'gear' | 'question';
export type ShopCategoryId = 'credit' | 'peripherals' | 'audio' | 'builder' | 'show' | 'computer';

export type ShopItem = {
	sku: string;
	title: string;
	blurb: string;
	category: ShopCategoryId;
	image: string;
	imageAlt: string;
	kind: ShopKind;
	/** Hours charged for one unit. Credits use 1 and the buyer picks how many. */
	hours: number;
	/** Dollars HackCast spends per unit. Null when the grant is not money. */
	dollars: number | null;
	/** Reveal copy when the grant is not a dollar amount. */
	grant: string | null;
};

export const shopCategories: { id: ShopCategoryId; label: string }[] = [
	{ id: 'credit', label: 'Credits' },
	{ id: 'peripherals', label: 'Peripherals' },
	{ id: 'audio', label: 'Audio and studio' },
	{ id: 'builder', label: 'Builder stuff' },
	{ id: 'show', label: 'The show' },
	{ id: 'computer', label: 'Laptop' }
];

export const shopCopy = {
	kicker: 'Shop',
	title: 'Spend approved hours',
	intro:
		'HackCast buys these for you from approved hours on your project. Tracked time is not spendable until a reviewer approves it. Use See grant amount on a card to see what HackCast will spend.',
	approved: 'Approved',
	available: 'Available',
	seeGrant: 'See grant amount',
	hideGrant: 'Hide grant amount',
	redeem: 'Redeem',
	confirm: 'Confirm redeem',
	short: 'Not enough hours',
	redeemed: 'Redeemed. It is waiting for approval.',
	down: 'We could not load your hours, so redeem is off for now.',
	empty: 'You have not redeemed anything yet.',
	yours: 'Your redemptions',
	creditNote: 'You can buy more than one hour. Each hour is its own credit.',
	missingAddress:
		'We do not have a shipping address from your Hack Club profile. Update it there, or contact support, then try again.',
	ask: 'What should we ask on the next episode?'
} as const;

export const hourRacePrize = {
	title: 'Guaranteed question',
	blurb:
		'If you are first in the hours race when we lock hours, your question goes on the episode. It is free. This is not something you redeem.',
	leading: 'You are first right now.',
	trailing: 'You are not first right now.'
} as const;

const img = (file: string, alt: string) => ({ image: file, imageAlt: alt });

export const shopCatalog: ShopItem[] = [
	{
		sku: 'print-credit',
		title: '3D printing credit',
		blurb: 'HackCast pays a print shop for you. Choose how many hours of credit you want.',
		category: 'credit',
		kind: 'credit',
		hours: 1,
		dollars: 5,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Imprimante_3D.jpg/960px-Imprimante_3D.jpg',
			'A desktop 3D printer'
		)
	},
	{
		sku: 'ai-credit',
		title: 'AI / API credit',
		blurb: 'HackCast covers AI and API bills. Choose how many hours of credit you want.',
		category: 'credit',
		kind: 'credit',
		hours: 1,
		dollars: 5,
		grant: null,
		...img(
			'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&h=600&q=70',
			'Abstract art of the letters AI'
		)
	},
	{
		sku: 'mouse',
		title: 'Mouse',
		blurb: 'A computer mouse for your desk.',
		category: 'peripherals',
		kind: 'gear',
		hours: 10,
		dollars: 40,
		grant: null,
		...img(
			'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&h=600&q=70',
			'A computer mouse'
		)
	},
	{
		sku: 'keyboard',
		title: 'Keyboard',
		blurb: 'A keyboard for writing code and notes.',
		category: 'peripherals',
		kind: 'gear',
		hours: 15,
		dollars: 60,
		grant: null,
		...img(
			'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&h=600&q=70',
			'A computer keyboard'
		)
	},
	{
		sku: 'webcam',
		title: 'Webcam',
		blurb: 'A webcam for calls and demos.',
		category: 'peripherals',
		kind: 'gear',
		hours: 10,
		dollars: 40,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/USB_webcam_for_PC.jpg/960px-USB_webcam_for_PC.jpg',
			'A USB webcam'
		)
	},
	{
		sku: 'usb-hub',
		title: 'USB hub',
		blurb: 'A USB hub for when your laptop runs out of ports.',
		category: 'peripherals',
		kind: 'gear',
		hours: 5,
		dollars: 20,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/2023_Hub_USB_2.0.jpg/960px-2023_Hub_USB_2.0.jpg',
			'A USB hub'
		)
	},
	{
		sku: 'ssd-1tb',
		title: 'External SSD 1TB',
		blurb: 'A 1TB drive for projects, photos, and footage.',
		category: 'peripherals',
		kind: 'gear',
		hours: 15,
		dollars: 60,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/SanDisk_Extreme_Portable_SSD_-_1TB%2C_USB-C_%2841036158305%29.jpg/960px-SanDisk_Extreme_Portable_SSD_-_1TB%2C_USB-C_%2841036158305%29.jpg',
			'A portable external SSD'
		)
	},
	{
		sku: 'sd-card',
		title: 'SD card + reader',
		blurb: 'An SD card and a reader for cameras and boards.',
		category: 'peripherals',
		kind: 'gear',
		hours: 5,
		dollars: 20,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/SanDisk_128MB_SD_card.jpg/960px-SanDisk_128MB_SD_card.jpg',
			'An SD card'
		)
	},
	{
		sku: 'laptop-stand',
		title: 'Laptop stand',
		blurb: 'A stand that lifts your laptop off the desk.',
		category: 'peripherals',
		kind: 'gear',
		hours: 7,
		dollars: 28,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Laptop_cooler.JPG/960px-Laptop_cooler.JPG',
			'A laptop stand'
		)
	},
	{
		sku: 'monitor-light',
		title: 'Monitor light bar',
		blurb: 'A light that sits on top of your monitor.',
		category: 'peripherals',
		kind: 'gear',
		hours: 9,
		dollars: 36,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Battery_powered_LED_desk_lamp-7420.jpg/960px-Battery_powered_LED_desk_lamp-7420.jpg',
			'A desk lamp'
		)
	},
	{
		sku: 'cable-tidy',
		title: 'Cable tidy / desk kit',
		blurb: 'Clips and sleeves so cables stay put.',
		category: 'peripherals',
		kind: 'gear',
		hours: 4,
		dollars: 16,
		grant: null,
		...img(
			'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&h=600&q=70',
			'Cables on a desk'
		)
	},
	{
		sku: 'usb-mic',
		title: 'USB condenser mic',
		blurb: 'A USB mic you can plug in and record with.',
		category: 'audio',
		kind: 'gear',
		hours: 10,
		dollars: 40,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/AKG_Perception_120_USB_condenser_microphone_with_SH_100_shock_mount.jpg/960px-AKG_Perception_120_USB_condenser_microphone_with_SH_100_shock_mount.jpg',
			'A USB condenser microphone'
		)
	},
	{
		sku: 'boom-arm',
		title: 'Boom arm',
		blurb: 'An arm that holds a mic over the desk.',
		category: 'audio',
		kind: 'gear',
		hours: 7,
		dollars: 28,
		grant: null,
		...img(
			'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&h=600&q=70',
			'A microphone on a boom arm'
		)
	},
	{
		sku: 'pop-filter',
		title: 'Pop filter',
		blurb: 'A screen that softens pops on a mic.',
		category: 'audio',
		kind: 'gear',
		hours: 3,
		dollars: 12,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Condenser_Microphone_with_Pop_Filter_and_Reflection_Filter.jpg/960px-Condenser_Microphone_with_Pop_Filter_and_Reflection_Filter.jpg',
			'A microphone with a pop filter'
		)
	},
	{
		sku: 'usb-mixer',
		title: 'USB mixer / interface',
		blurb: 'A small USB mixer or audio interface.',
		category: 'audio',
		kind: 'gear',
		hours: 15,
		dollars: 60,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Focusrite_Scarlett_2i2%2C_2i4%2C_6i6_USB2.0_Audio_Interfaces_with_Focusrite_Mic_Preamps_-_2014_NAMM_Show_%28by_Matt_Vanacoro%29.jpg/960px-Focusrite_Scarlett_2i2%2C_2i4%2C_6i6_USB2.0_Audio_Interfaces_with_Focusrite_Mic_Preamps_-_2014_NAMM_Show_%28by_Matt_Vanacoro%29.jpg',
			'USB audio interfaces'
		)
	},
	{
		sku: 'headphones',
		title: 'Closed-back headphones',
		blurb: 'Headphones that keep the sound in while you edit.',
		category: 'audio',
		kind: 'gear',
		hours: 10,
		dollars: 40,
		grant: null,
		...img(
			'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&h=600&q=70',
			'A pair of headphones'
		)
	},
	{
		sku: 'xlr-kit',
		title: 'XLR + shock mount kit',
		blurb: 'An XLR cable and a shock mount for a mic.',
		category: 'audio',
		kind: 'gear',
		hours: 6,
		dollars: 24,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Xlr-connectors.jpg/960px-Xlr-connectors.jpg',
			'XLR connectors'
		)
	},
	{
		sku: 'record-player',
		title: 'Record player',
		blurb: 'An entry belt-drive record player.',
		category: 'audio',
		kind: 'gear',
		hours: 20,
		dollars: 80,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Kazantip%2C_Popovka%2C_Crimea%2C_Technics_turntable%2C_Vinyl_turntable.jpg/960px-Kazantip%2C_Popovka%2C_Crimea%2C_Technics_turntable%2C_Vinyl_turntable.jpg',
			'A turntable'
		)
	},
	{
		sku: 'soldering-kit',
		title: 'Soldering iron kit',
		blurb: 'A starter iron for soldering wires and boards.',
		category: 'builder',
		kind: 'gear',
		hours: 8,
		dollars: 32,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Soldering_iron_%28UK_Plug%29.jpg/960px-Soldering_iron_%28UK_Plug%29.jpg',
			'A soldering iron'
		)
	},
	{
		sku: 'multimeter',
		title: 'Multimeter',
		blurb: 'A meter for checking voltage and continuity.',
		category: 'builder',
		kind: 'gear',
		hours: 7,
		dollars: 28,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/a/a6/Digital_Multimeter_Aka.jpg',
			'A digital multimeter'
		)
	},
	{
		sku: 'breadboard',
		title: 'Breadboard + jumpers',
		blurb: 'A breadboard and jumper wires for trying circuits.',
		category: 'builder',
		kind: 'gear',
		hours: 4,
		dollars: 16,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/400_points_breadboard.jpg/960px-400_points_breadboard.jpg',
			'A breadboard'
		)
	},
	{
		sku: 'arduino',
		title: 'Arduino starter kit',
		blurb: 'A kit to start building with Arduino.',
		category: 'builder',
		kind: 'gear',
		hours: 10,
		dollars: 40,
		grant: null,
		...img(
			'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&h=600&q=70',
			'An Arduino Uno board'
		)
	},
	{
		sku: 'pi-zero',
		title: 'Raspberry Pi Zero kit',
		blurb: 'A small Pi kit for tiny projects.',
		category: 'builder',
		kind: 'gear',
		hours: 10,
		dollars: 40,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Raspberry_Pi_Zero_2_W_--_2024_--_0008.jpg/960px-Raspberry_Pi_Zero_2_W_--_2024_--_0008.jpg',
			'A Raspberry Pi Zero'
		)
	},
	{
		sku: 'ssd-enclosure',
		title: 'Portable SSD enclosure',
		blurb: 'A case that turns a bare drive into a portable SSD.',
		category: 'builder',
		kind: 'gear',
		hours: 6,
		dollars: 24,
		grant: null,
		...img('https://upload.wikimedia.org/wikipedia/commons/d/d8/Disk_enclosure_2.5_a.jpg', 'A drive enclosure')
	},
	{
		sku: 'drawing-tablet',
		title: 'Drawing tablet',
		blurb: 'An entry tablet for drawing on the computer.',
		category: 'builder',
		kind: 'gear',
		hours: 10,
		dollars: 40,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Wacom_One_graphics_tablet_with_pen_and_disc%2C_front.jpg/960px-Wacom_One_graphics_tablet_with_pen_and_disc%2C_front.jpg',
			'A drawing tablet and pen'
		)
	},
	{
		sku: 'ring-light',
		title: 'Ring light',
		blurb: 'A ring light for video and calls.',
		category: 'builder',
		kind: 'gear',
		hours: 7,
		dollars: 28,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Ring_Light_25280737679.jpg/960px-Ring_Light_25280737679.jpg',
			'A ring light'
		)
	},
	{
		sku: 'tripod',
		title: 'Tripod / phone mount',
		blurb: 'A tripod with a mount for your phone.',
		category: 'builder',
		kind: 'gear',
		hours: 5,
		dollars: 20,
		grant: null,
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Mini_tripod_and_phone_holder.jpg/960px-Mini_tripod_and_phone_holder.jpg',
			'A small tripod with a phone mount'
		)
	},
	{
		sku: 'ask-on-air',
		title: 'Ask a question on the next episode',
		blurb: 'Spend hours to have one question asked on the next episode. Write the question when you redeem.',
		category: 'show',
		kind: 'question',
		hours: 5,
		dollars: null,
		grant: 'A question on the next episode',
		...img(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ea_f20_microphone.jpg/960px-Ea_f20_microphone.jpg',
			'A studio microphone'
		)
	},
	{
		sku: 'laptop',
		title: 'Laptop',
		blurb: 'A laptop for building. This one takes more hours than the rest.',
		category: 'computer',
		kind: 'gear',
		hours: 50,
		dollars: 300,
		grant: null,
		...img(
			'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&h=600&q=70',
			'A laptop on a desk'
		)
	}
];

const bySku = new Map(shopCatalog.map((item) => [item.sku, item]));

export function shopItem(sku: string): ShopItem | undefined {
	return bySku.get(sku);
}

/** Whole hours a person can stack from the seconds they still have. */
export function maxStackHours(availableSeconds: number): number {
	if (!Number.isFinite(availableSeconds) || availableSeconds <= 0) return 0;
	return Math.floor(availableSeconds / 3600);
}

export const MAX_STACK_HOURS = 200;

export function parseStackHours(value: unknown): number | null {
	const raw = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
	if (!/^\d+$/.test(raw)) return null;
	const hours = Number(raw);
	if (!Number.isInteger(hours) || hours < 1 || hours > MAX_STACK_HOURS) return null;
	return hours;
}

export function canAfford(availableSeconds: number, costSeconds: number): boolean {
	return (
		Number.isFinite(availableSeconds) &&
		Number.isFinite(costSeconds) &&
		costSeconds > 0 &&
		availableSeconds >= costSeconds
	);
}

export function grantLabelFor(item: ShopItem, hours: number): string {
	if (item.dollars == null) return item.grant ?? '';
	const total = item.kind === 'credit' ? item.dollars * hours : item.dollars;
	return `$${total}`;
}

export function hoursLabel(totalSeconds: number): string {
	const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
	const h = Math.floor(safe / 3600);
	const m = Math.floor((safe % 3600) / 60);
	if (h === 0 && m === 0) return '0 hours';
	if (h === 0) return `${m}m`;
	if (m === 0) return h === 1 ? '1 hour' : `${h} hours`;
	return `${h}h ${m}m`;
}

export function money(cents: number): string {
	const dollars = cents / 100;
	return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

export type Quote =
	| {
			ok: true;
			item: ShopItem;
			hours: number;
			seconds: number;
			grantCents: number | null;
			grantLabel: string;
	  }
	| { ok: false; message: string };

export function quoteRedeem(sku: unknown, hoursInput: unknown): Quote {
	if (typeof sku !== 'string') return { ok: false, message: 'That item is not in the shop.' };
	const item = bySku.get(sku);
	if (!item) return { ok: false, message: 'That item is not in the shop.' };
	const hours = item.kind === 'credit' ? parseStackHours(hoursInput) : item.hours;
	if (hours == null) return { ok: false, message: 'Pick a whole number of hours.' };
	const grantCents = item.dollars == null ? null : item.dollars * (item.kind === 'credit' ? hours : 1) * 100;
	return {
		ok: true,
		item,
		hours,
		seconds: hours * 3600,
		grantCents,
		grantLabel: grantLabelFor(item, hours)
	};
}

export type ShipTo = {
	name: string;
	line1: string;
	line2: string | null;
	city: string;
	state: string | null;
	postalCode: string;
	country: string;
};

function field(form: FormData, key: string, max: number): string {
	const value = form.get(key);
	if (typeof value !== 'string') return '';
	const clean = value.replace(/\s+/g, ' ').trim();
	if (/[\u0000-\u001f\u007f]/.test(clean)) return '';
	return clean.slice(0, max);
}

export function parseShipTo(form: FormData): { ok: true; value: ShipTo } | { ok: false; message: string } {
	const name = field(form, 'shipName', 80);
	const line1 = field(form, 'addressLine1', 120);
	const line2 = field(form, 'addressLine2', 120);
	const city = field(form, 'city', 80);
	const state = field(form, 'state', 80);
	const postalCode = field(form, 'postalCode', 20);
	const country = field(form, 'country', 80);
	if (!name || !line1 || !city || !postalCode || !country) {
		return { ok: false, message: 'Add a shipping address so we can send it.' };
	}
	return {
		ok: true,
		value: { name, line1, line2: line2 || null, city, state: state || null, postalCode, country }
	};
}

export function parseOnAirQuestion(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const clean = value.replace(/\s+/g, ' ').trim();
	if (clean.length < 3 || clean.length > 500) return null;
	if (/[\u0000-\u001f\u007f]/.test(clean)) return null;
	return clean;
}

export const memberStatusLabel: Record<RedemptionStatus, string> = {
	pending: 'waiting',
	approved: 'approved',
	fulfilled: 'done',
	rejected: 'declined'
};
