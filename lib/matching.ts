import { tasks } from './model.ts';
import type { Member, Listing, Edge, Match } from './model.ts';
export function taskKeys(text: string) { const normalized = text.toLowerCase(); return Object.entries(tasks).filter(([, v]) => v.aliases.some(a => new RegExp('\\b' + a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?\\b', 'i').test(normalized))).map(([k]) => k); }
export function compatible(a: Member, b: Member, offer: Listing, need: Listing): Edge | null {
    if (a.id === b.id || a.scope !== b.scope || !offer.active || !need.active || offer.category !== need.category)
        return null;
    const o = taskKeys(offer.title + ' ' + offer.tags), n = taskKeys(need.title + ' ' + need.tags);
    if (!o.some(k => n.includes(k)))
        return null;
    if ((a.mode === 'remote' && b.mode === 'in-person') || (b.mode === 'remote' && a.mode === 'in-person'))
        return null;
    const local = ['Garden', 'Automotive', 'Home', 'Cooking'].includes(offer.category);
    if (local && (a.mode === 'remote' || b.mode === 'remote'))
        return null;
    const times = a.availability.split(',').map(v => v.trim());
    if (!times.includes('Flexible') && !b.availability.includes('Flexible') && !times.some(v => b.availability.split(',').map(x => x.trim()).includes(v)))
        return null;
    const ratio = Math.max(offer.hours, need.hours) / Math.min(offer.hours, need.hours);
    if (ratio > 2)
        return null;
    const same = a.neighborhood === b.neighborhood;
    return { from: a.id, to: b.id, offer, need, score: Math.round(80 + (same ? 10 : 3) + (ratio <= 1.25 ? 10 : 3)), reasons: ['Specific task matches', same ? 'Same neighborhood' : local ? 'Travel within Detroit needs agreement' : 'Flexible Detroit / remote connection', 'Availability overlaps', ratio <= 1.25 ? 'Similar effort' : 'Confirm scope and effort together'] };
}
export function findMatches(members: Member[], listings: Listing[], excluded: string[] = [], blocked: {
    member_id: string;
    target_id: string;
}[] = []): Match[] {
    const edges: Edge[] = [];
    for (const a of members)
        for (const b of members) {
            if (blocked.some(x => (x.member_id === a.id && x.target_id === b.id) || (x.member_id === b.id && x.target_id === a.id)))
                continue;
            let best: Edge | null = null;
            for (const o of listings.filter(x => x.member_id === a.id && x.kind === 'offer'))
                for (const n of listings.filter(x => x.member_id === b.id && x.kind === 'need')) {
                    const e = compatible(a, b, o, n);
                    if (e && (!best || e.score > best.score))
                        best = e;
                }
            if (best)
                edges.push(best);
        }
    const result: Match[] = [];
    const seen = new Set<string>();
    const add = (cycle: Edge[]) => { const effortRatio = Math.max(...cycle.map(e => e.offer.hours)) / Math.min(...cycle.map(e => e.offer.hours)); if (effortRatio > 2)
        return; const key = cycle.map(e => e.offer.id + '>' + e.need.id).sort().join('|'); if (seen.has(key) || excluded.includes(key))
        return; seen.add(key); const score = Math.round(cycle.reduce((s, e) => s + e.score, 0) / cycle.length); result.push({ id: key, type: cycle.length === 2 ? 'direct' : 'circle', score, edges: cycle, explanation: `Every neighbor gives and receives a specific skill. ${effortRatio <= 1.25 && cycle.every(e => e.reasons.includes('Similar effort')) ? 'Effort is closely balanced.' : 'Discuss the difference in scope before accepting.'} Availability overlaps; agree on exact dates together.` }); };
    for (const a of edges)
        for (const b of edges.filter(e => e.from === a.to)) {
            if (b.to === a.from)
                add([a, b]);
            else
                for (const c of edges.filter(e => e.from === b.to && e.to === a.from))
                    add([a, b, c]);
        }
    return result.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
