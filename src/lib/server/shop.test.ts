import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	canAfford,
	grantLabelFor,
	hoursLabel,
	maxStackHours,
	parseOnAirQuestion,
	parseShipTo,
	quoteRedeem,
	shopCatalog,
	shopCopy,
	shopItem,
	hourRacePrize
} from '../shop.ts';

const spec: [string, number, number | null, 'credit' | 'gear' | 'question'][] = [
	['print-credit', 1, 5, 'credit'],
	['ai-credit', 1, 5, 'credit'],
	['mouse', 10, 40, 'gear'],
	['keyboard', 15, 60, 'gear'],
	['webcam', 10, 40, 'gear'],
	['usb-hub', 5, 20, 'gear'],
	['ssd-1tb', 15, 60, 'gear'],
	['sd-card', 5, 20, 'gear'],
	['laptop-stand', 7, 28, 'gear'],
	['monitor-light', 9, 36, 'gear'],
	['cable-tidy', 4, 16, 'gear'],
	['usb-mic', 10, 40, 'gear'],
	['boom-arm', 7, 28, 'gear'],
	['pop-filter', 3, 12, 'gear'],
	['usb-mixer', 15, 60, 'gear'],
	['headphones', 10, 40, 'gear'],
	['xlr-kit', 6, 24, 'gear'],
	['record-player', 20, 80, 'gear'],
	['soldering-kit', 8, 32, 'gear'],
	['multimeter', 7, 28, 'gear'],
	['breadboard', 4, 16, 'gear'],
	['arduino', 10, 40, 'gear'],
	['pi-zero', 10, 40, 'gear'],
	['ssd-enclosure', 6, 24, 'gear'],
	['drawing-tablet', 10, 40, 'gear'],
	['ring-light', 7, 28, 'gear'],
	['tripod', 5, 20, 'gear'],
	['ask-on-air', 5, null, 'question'],
	['laptop', 50, 300, 'gear']
];

describe('shop catalog', () => {
	it('locks the SKUs, hours, and grant dollars', () => {
		assert.equal(shopCatalog.length, spec.length);
		spec.forEach(([sku, hours, dollars, kind], index) => {
			const item = shopCatalog[index];
			assert.equal(item.sku, sku);
			assert.equal(item.hours, hours);
			assert.equal(item.dollars, dollars);
			assert.equal(item.kind, kind);
			assert.equal(shopItem(sku)?.sku, sku);
			if (kind === 'credit') assert.equal(dollars, 5);
			if (kind === 'gear' && sku !== 'laptop') assert.equal((dollars ?? 0) / hours, 4);
			if (sku === 'laptop') assert.equal(dollars! / hours, 6);
		});
		assert.equal(shopCatalog.some((item) => /guest|sticker|hoodie|tee\b|merch/i.test(item.sku + item.title)), false);
		assert.equal(shopCatalog.some((item) => item.image.includes('picsum')), false);
		assert.equal(shopCatalog.every((item) => item.image.startsWith('https://')), true);
		assert.equal(shopCopy.seeGrant, 'See grant amount');
	});

	it('keeps user-facing copy free of heavy punctuation', () => {
		const banned = /[;—–()]|\[|\]/;
		const strings = [
			...Object.values(shopCopy),
			...Object.values(hourRacePrize),
			...shopCatalog.flatMap((item) => [item.title, item.blurb, item.grant, item.imageAlt].filter(Boolean))
		];
		for (const value of strings) assert.doesNotMatch(String(value), banned, String(value));
	});
});

describe('shop quotes', () => {
	it('prices a fixed item from the catalog and ignores a posted hour count', () => {
		const quote = quoteRedeem('mouse', '99');
		assert.equal(quote.ok, true);
		if (!quote.ok) return;
		assert.equal(quote.hours, 10);
		assert.equal(quote.seconds, 36000);
		assert.equal(quote.grantCents, 4000);
		assert.equal(quote.grantLabel, '$40');
	});

	it('stacks credit by the hour', () => {
		const quote = quoteRedeem('print-credit', '4');
		assert.equal(quote.ok, true);
		if (!quote.ok) return;
		assert.equal(quote.hours, 4);
		assert.equal(quote.grantCents, 2000);
		assert.equal(quote.grantLabel, '$20');
		assert.equal(grantLabelFor(quote.item, 1), '$5');
		assert.equal(quoteRedeem('ai-credit', '0').ok, false);
		assert.equal(quoteRedeem('ai-credit', '1.5').ok, false);
	});

	it('reveals the on-air question without a dollar amount', () => {
		const quote = quoteRedeem('ask-on-air', null);
		assert.equal(quote.ok, true);
		if (!quote.ok) return;
		assert.equal(quote.hours, 5);
		assert.equal(quote.grantCents, null);
		assert.equal(quote.grantLabel, 'A question on the next episode');
		assert.equal(quote.grantLabel.includes('$'), false);
	});

	it('refuses unknown items and hours the balance cannot cover', () => {
		assert.equal(quoteRedeem('guest-spot', 1).ok, false);
		assert.equal(canAfford(10 * 3600, 10 * 3600), true);
		assert.equal(canAfford(10 * 3600 - 1, 10 * 3600), false);
		assert.equal(maxStackHours(5 * 3600 + 1800), 5);
		assert.equal(maxStackHours(0), 0);
		assert.equal(hoursLabel(0), '0 hours');
		assert.equal(hoursLabel(3600), '1 hour');
		assert.equal(hoursLabel(72000), '20 hours');
		assert.equal(hoursLabel(5400), '1h 30m');
	});

	it('needs a real address for gear and a question for the episode item', () => {
		const form = new FormData();
		assert.equal(parseShipTo(form).ok, false);
		form.set('shipName', 'Ada Lovelace');
		form.set('addressLine1', '1 Analytical Way');
		form.set('city', 'London');
		form.set('postalCode', 'N1 1AA');
		form.set('country', 'United Kingdom');
		const parsed = parseShipTo(form);
		assert.equal(parsed.ok, true);
		assert.equal(parseOnAirQuestion('Hi'), null);
		assert.equal(parseOnAirQuestion('Why do you ship?'), 'Why do you ship?');
	});
});
