import { fail } from '@sveltejs/kit';
import { guestVoteEpisode } from '#lib/content.ts';
import { groupGuestVotes, raceName } from '#lib/server/projects.ts';
import { guestVotes, setGuestStatus, type GuestStatus } from '#lib/server/questions.ts';
import { requireStaff } from '#lib/server/staff.ts';
import { UUID } from '#lib/server/submission-form.ts';
import type { Actions, PageServerLoad } from './$types';

const STATUSES: GuestStatus[] = ['new', 'shortlisted', 'dismissed'];

export const load: PageServerLoad = async (event) => {
	await requireStaff(event, 'admin', '/admin/guests');
	try {
		const votes = await guestVotes(guestVoteEpisode);
		return {
			episode: guestVoteEpisode,
			unavailable: false,
			groups: groupGuestVotes(votes).map((group) => ({
				...group,
				voters: group.voters.map(raceName),
				lastAt: group.lastAt.toISOString()
			})),
			latest: votes.slice(0, 50).map((vote) => ({
				category: vote.category,
				name: vote.name,
				voter: raceName(vote.voter),
				at: vote.at.toISOString()
			}))
		};
	} catch {
		console.error('guest votes failed');
		return { episode: guestVoteEpisode, unavailable: true, groups: [], latest: [] };
	}
};

export const actions: Actions = {
	status: async (event) => {
		await requireStaff(event, 'admin', '/admin/guests');
		const form = await event.request.formData();
		const ids = String(form.get('ids') ?? '')
			.split(',')
			.filter((id) => UUID.test(id));
		const status = form.get('status') as GuestStatus;
		if (ids.length === 0 || !STATUSES.includes(status)) return fail(400, { message: 'Pick a guest and a status.' });
		await setGuestStatus(ids, status);
		return { message: null };
	}
};
