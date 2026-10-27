import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { getChatGPTUser } from '../../chatgpt-auth';
import { seedData } from '../../../lib/seed';
import { findMatches } from '../../../lib/matching';
import { categories, neighborhoods } from '../../../lib/model';
import type { Member, Listing, Match } from '../../../lib/model';
import { openAIProvider, ruleProvider } from '../../../lib/ai';
export const dynamic = 'force-dynamic';
type Ctx = {
    scope: string;
    actor: string;
    demo: number;
    session?: string;
};
const db = () => { if (!env.DB)
    throw new Error('Database unavailable'); return env.DB; };
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
async function sessionKey(token: string) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))).map(x => x.toString(16).padStart(2, '0')).join(''); }
const q = (sql: string, ...args: (string | number | null)[]) => db().prepare(sql).bind(...args);
async function rows<T>(sql: string, ...args: (string | number)[]) { return (await q(sql, ...args).all<T>()).results; }
function json(data: unknown, status = 200, cookie?: string) { return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) } }); }
function cookie(req: Request, key: string) { return req.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith(key + '='))?.slice(key.length + 1); }
function sessionCookie(req: Request, value: string) { return `cc_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${new URL(req.url).protocol === 'https:' ? '; Secure' : ''}`; }
async function context(req: Request): Promise<Ctx | null> { const token = cookie(req, 'cc_session'); if (token && token !== 'member') {
    const s = await q('SELECT * FROM sessions WHERE id=? AND created>?', await sessionKey(token), new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()).first<{
        id: string;
        actor: string;
    }>();
    if (s)
        return { scope: s.id, actor: s.actor, demo: 1, session: s.id };
} if (token === 'member') {
    const user = await getChatGPTUser();
    if (user) {
        const m = await q('SELECT id FROM members WHERE auth_id=?', user.userId).first<{
            id: string;
        }>();
        if (m)
            return { scope: 'community', actor: m.id, demo: 0 };
    }
} return null; }
async function community(c: Ctx) { const [members, listings, blocks] = await Promise.all([rows<Member>('SELECT id,scope,name,neighborhood,bio,availability,mode,demo FROM members WHERE scope=?', c.scope), rows<Listing>('SELECT * FROM listings WHERE scope=? AND active=1', c.scope), rows<{
        member_id: string;
        target_id: string;
    }>('SELECT member_id,target_id FROM blocks WHERE scope=?', c.scope)]); return { members, listings, blocks }; }
async function saveMatches(c: Ctx, found: Match[]) { if (!found.length)
    return; const statements = []; for (const m of found) {
    statements.push(q('INSERT INTO matches (id,scope,type,score,explanation,data,demo,created) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET score=excluded.score,explanation=excluded.explanation,data=excluded.data WHERE NOT EXISTS (SELECT 1 FROM exchanges WHERE match_id=excluded.id)', m.id, c.scope, m.type, m.score, m.explanation, JSON.stringify(m), c.demo, now()));
    for (const e of m.edges)
        statements.push(q('INSERT OR IGNORE INTO match_edges (id,match_id,from_id,to_id,offer_id,need_id) VALUES (?,?,?,?,?,?)', m.id + ':' + e.from, m.id, e.from, e.to, e.offer.id, e.need.id));
} await db().batch(statements); }
async function snapshot(c: Ctx) {
    const base = await community(c);
    const exchanges = await rows<Record<string, unknown>>('SELECT e.*,m.data AS match_data FROM exchanges e JOIN matches m ON m.id=e.match_id WHERE e.scope=? ORDER BY e.created DESC', c.scope);
    const approvals = await rows<Record<string, unknown>>('SELECT a.* FROM exchange_approvals a JOIN exchanges e ON e.id=a.exchange_id WHERE e.scope=?', c.scope);
    const ai = await rows<Record<string, unknown>>('SELECT provider,success,latency,request_type FROM ai_activity WHERE scope=?', c.scope);
    const events = await rows<{
        value: number;
    }>('SELECT value FROM impact_events WHERE scope=? AND type=?', c.scope, 'completed');
    const occupied = new Set(exchanges.filter(e => e.status !== 'Cancelled').flatMap(e => (JSON.parse(e.match_data as string) as Match).edges.flatMap(x => [x.offer.id, x.need.id])));
    const matches = findMatches(base.members, base.listings, exchanges.map(e => e.match_id as string), base.blocks).filter(m => !m.edges.some(e => occupied.has(e.offer.id) || occupied.has(e.need.id)));
    return { ...base, actor: c.actor, demo: !!c.demo, matches, exchanges: exchanges.filter(e => approvals.some(a => a.exchange_id === e.id && a.member_id === c.actor)).map(e => ({ ...e, match: JSON.parse(e.match_data as string), approvals: approvals.filter(a => a.exchange_id === e.id) })), stats: { members: base.members.length, offers: base.listings.filter(x => x.kind === 'offer').length, needs: base.listings.filter(x => x.kind === 'need').length, matches: (await q('SELECT COUNT(*) AS n FROM matches WHERE scope=?', c.scope).first<{
                n: number;
            }>())?.n || 0, proposals: exchanges.length, accepted: exchanges.filter(e => ['Accepted', 'In Progress', 'Completed'].includes(e.status as string)).length, completed: exchanges.filter(e => e.status === 'Completed').length, hours: events.reduce((s, e) => s + e.value, 0), circles: exchanges.filter(e => (JSON.parse(e.match_data as string) as Match).type === 'circle').length, aiRequests: ai.filter(a => a.provider === 'openai').length, aiSuccess: ai.filter(a => a.provider === 'openai' && a.success).length, fallback: ai.filter(a => a.provider === 'rules').length, latency: ai.filter(a => a.provider === 'openai' && a.success).reduce((s, a) => s + Number(a.latency), 0) / Math.max(1, ai.filter(a => a.provider === 'openai' && a.success).length), aiProposals: exchanges.filter(e=>e.ai===1).length, aiAccepted: exchanges.filter(e=>e.ai===1&&['Accepted','In Progress','Completed'].includes(e.status as string)).length }, aiAvailable: !!((env as unknown as Record<string, string>).OPENAI_API_KEY && (env as unknown as Record<string, string>).OPENAI_MODEL) };
}
export async function GET(req: Request) { try {
    const c = await context(req);
    return json(c ? await snapshot(c) : { guest: true });
}
catch {
    return json({ error: 'The community could not load. Please retry.' }, 503);
} }
const listingSchema = z.object({ id: z.string().optional(), kind: z.enum(['offer', 'need']), category: z.string().refine(x => categories.includes(x)), title: z.string().trim().min(4).max(100), description: z.string().trim().min(10).max(800), tags: z.string().max(200), hours: z.coerce.number().min(.5).max(40) });
export async function POST(req: Request) {
    try {
        const origin = req.headers.get('origin');
        if (!origin || origin !== new URL(req.url).origin)
            return json({ error: 'Invalid request origin.' }, 403);
        if (Number(req.headers.get('content-length') || 0) > 16000)
            return json({ error: 'Request too large.' }, 413);
        const bodyText = await req.text();
        if (bodyText.length > 16000)
            return json({ error: 'Request too large.' }, 413);
        const body = JSON.parse(bodyText);
        const action = z.string().parse(body.action);
        if (action === 'demo') {
            const existing = await context(req);
            if (existing?.demo)
                return json(await snapshot(existing));
            return createDemo(req);
        }
        if (action === 'join') {
            const user = await getChatGPTUser();
            if (!user)
                return json({ error: 'Sign in with ChatGPT to create a member account.', signIn: true }, 401);
            const existing = await q('SELECT id FROM members WHERE auth_id=?', user.userId).first<{
                id: string;
            }>();
            const memberId = existing?.id || id();
            if (!existing)
                await q('INSERT INTO members (id,scope,auth_id,name,neighborhood,bio,availability,mode,demo,created) VALUES (?,?,?,?,?,?,?,?,?,?)', memberId, 'community', user.userId, 'New neighbor', 'Corktown', 'Ready to share a skill.', 'Flexible', 'both', 0, now()).run();
            return json(await snapshot({ scope: 'community', actor: memberId, demo: 0 }), 200, sessionCookie(req, 'member'));
        }
        const c = await context(req);
        if (!c)
            return json({ error: 'Enter the demo or sign in first.' }, 401);
        if (action === 'reset') {
            if (!c.demo)
                return json({ error: 'Only a demo can be reset.' }, 403);
            await db().batch([q('DELETE FROM listing_reservations WHERE exchange_id IN (SELECT id FROM exchanges WHERE scope=?)', c.scope), q('DELETE FROM exchange_approvals WHERE exchange_id IN (SELECT id FROM exchanges WHERE scope=?)', c.scope), q('DELETE FROM exchanges WHERE scope=?', c.scope), q('DELETE FROM match_edges WHERE match_id IN (SELECT id FROM matches WHERE scope=?)', c.scope), q('DELETE FROM matches WHERE scope=?', c.scope), q('DELETE FROM listings WHERE scope=?', c.scope), q('DELETE FROM members WHERE scope=?', c.scope), q('DELETE FROM impact_events WHERE scope=?', c.scope), q('DELETE FROM ai_activity WHERE scope=?', c.scope), q('DELETE FROM blocks WHERE scope=?', c.scope), q('DELETE FROM sessions WHERE id=?', c.scope)]);
            return createDemo(req);
        }
        if (action === 'switch') {
            if (!c.demo)
                return json({ error: 'Member accounts cannot switch identity.' }, 403);
            const m = await q('SELECT id FROM members WHERE id=? AND scope=? AND demo=1', z.string().parse(body.memberId), c.scope).first<{
                id: string;
            }>();
            if (!m)
                return json({ error: 'Unknown demo participant.' }, 404);
            await q('UPDATE sessions SET actor=? WHERE id=?', m.id, c.session!).run();
            c.actor = m.id;
        }
        else if (action === 'profile') {
            const p = z.object({ name: z.string().trim().min(2).max(60), bio: z.string().trim().max(600), neighborhood: z.string().refine(x => neighborhoods.includes(x)), availability: z.enum(['Morning', 'Evening', 'Weekend', 'Flexible']), mode: z.enum(['both', 'remote', 'in-person']) }).parse(body.profile);
            await q('UPDATE members SET name=?,bio=?,neighborhood=?,availability=?,mode=? WHERE id=? AND scope=?', p.name, p.bio, p.neighborhood, p.availability, p.mode, c.actor, c.scope).run();
        }
        else if (action === 'listing') {
            const l = listingSchema.parse(body.listing);
            if (l.id) {
                const result = await q('UPDATE listings SET kind=?,category=?,title=?,description=?,tags=?,hours=? WHERE id=? AND member_id=? AND scope=? AND active=1', l.kind, l.category, l.title, l.description, l.tags, l.hours, l.id, c.actor, c.scope).run();
                if (!result.meta.changes)
                    return json({ error: 'You can edit only your own active listing.' }, 403);
            }
            else
                await q('INSERT INTO listings (id,member_id,scope,kind,category,title,description,tags,hours,active) VALUES (?,?,?,?,?,?,?,?,?,1)', id(), c.actor, c.scope, l.kind, l.category, l.title, l.description, l.tags, l.hours).run();
        }
        else if (action === 'remove') {
            const r = await q('UPDATE listings SET active=0 WHERE id=? AND member_id=? AND scope=?', z.string().parse(body.id), c.actor, c.scope).run();
            if (!r.meta.changes)
                return json({ error: 'You can remove only your own listing.' }, 403);
        }
        else if (action === 'discover') {
            const b = await community(c);
            await saveMatches(c, findMatches(b.members, b.listings, [], b.blocks).filter(m => m.edges.some(e => e.from === c.actor)));
        }
        else if (action === 'propose') {
            const s = await snapshot(c);
            const match = s.matches.find(m => m.id === body.matchId && m.edges.some(e => e.from === c.actor));
            if (!match)
                return json({ error: 'This match is no longer available. Refresh your matches.' }, 409);
            await saveMatches(c, [match]);
            const description = z.string().trim().min(10).max(1800).parse(body.description);
            const timeline = z.string().trim().min(3).max(200).parse(body.timeline);
            const eid = id(), time = now();
            const statements = [q('INSERT INTO exchanges (id,scope,match_id,title,description,timeline,status,hours,ai,created,updated) VALUES (?,?,?,?,?,?,?,?,0,?,?)', eid, c.scope, match.id, match.type === 'circle' ? 'A new Comeback Circle' : 'A neighbor-to-neighbor trade', description, timeline, 'Proposed', match.edges.reduce((sum, e) => sum + e.offer.hours, 0), time, time)];
            for (const e of match.edges)
                statements.push(q('INSERT INTO exchange_approvals (id,exchange_id,member_id,approved,completed,updated) VALUES (?,?,?,?,0,?)', eid + ':' + e.from, eid, e.from, e.from === c.actor ? 1 : 0, time));
            for (const lid of new Set(match.edges.flatMap(e => [e.offer.id, e.need.id])))
                statements.push(q('INSERT INTO listing_reservations (listing_id,exchange_id) VALUES (?,?)', lid, eid));
            await db().batch(statements);
        }
        else if (['approve', 'start', 'complete', 'cancel'].includes(action)) {
            const eid = z.string().parse(body.id);
            const ex = await q('SELECT e.* FROM exchanges e JOIN exchange_approvals a ON a.exchange_id=e.id WHERE e.id=? AND e.scope=? AND a.member_id=?', eid, c.scope, c.actor).first<{
                status: string;
                hours: number;
            }>();
            if (!ex)
                return json({ error: 'Only a participant can change this exchange.' }, 403);
            const time = now();
            if (action === 'approve') {
                if (ex.status !== 'Proposed')
                    return json({ error: 'This proposal is no longer awaiting approval.' }, 409);
                await db().batch([q("UPDATE exchange_approvals SET approved=1,updated=? WHERE exchange_id=? AND member_id=? AND EXISTS (SELECT 1 FROM exchanges WHERE id=? AND status='Proposed')", time, eid, c.actor, eid), q("UPDATE exchanges SET status='Accepted',updated=? WHERE id=? AND status='Proposed' AND NOT EXISTS (SELECT 1 FROM exchange_approvals WHERE exchange_id=? AND approved=0)", time, eid, eid)]);
            }
            if (action === 'start') {
                if (ex.status !== 'Accepted')
                    return json({ error: 'Everyone must approve before work starts.' }, 409);
                await q("UPDATE exchanges SET status='In Progress',updated=? WHERE id=? AND status='Accepted'", time, eid).run();
            }
            if (action === 'complete') {
                if (ex.status !== 'In Progress')
                    return json({ error: 'Start the accepted exchange before confirming completion.' }, 409);
                await db().batch([q("UPDATE exchange_approvals SET completed=1,updated=? WHERE exchange_id=? AND member_id=? AND EXISTS (SELECT 1 FROM exchanges WHERE id=? AND status='In Progress')", time, eid, c.actor, eid), q("UPDATE exchanges SET status='Completed',updated=? WHERE id=? AND status='In Progress' AND NOT EXISTS (SELECT 1 FROM exchange_approvals WHERE exchange_id=? AND completed=0)", time, eid, eid), q("INSERT OR IGNORE INTO impact_events (id,scope,type,reference_id,value,demo,created) SELECT ?,?,'completed',id,hours,?,? FROM exchanges WHERE id=? AND status='Completed'", eid + ':completed', c.scope, c.demo, time, eid)]);
            }
            if (action === 'cancel') {
                if (['Completed', 'Cancelled'].includes(ex.status))
                    return json({ error: 'This exchange is already closed.' }, 409);
                await db().batch([q("UPDATE exchanges SET status='Cancelled',updated=? WHERE id=? AND status NOT IN ('Completed','Cancelled')", time, eid), q("DELETE FROM listing_reservations WHERE exchange_id=? AND EXISTS (SELECT 1 FROM exchanges WHERE id=? AND status='Cancelled')", eid, eid)]);
            }
        }
        else if (action === 'block') {
            const target = z.string().parse(body.memberId), reason = z.string().trim().min(3).max(500).parse(body.reason);
            if (target === c.actor || !await q('SELECT id FROM members WHERE id=? AND scope=?', target, c.scope).first())
                return json({ error: 'Unknown neighbor.' }, 400);
            await q('INSERT OR REPLACE INTO blocks (id,scope,member_id,target_id,reason,created) VALUES (?,?,?,?,?,?)', c.actor + ':' + target, c.scope, c.actor, target, reason, now()).run();
        }
        else if (action === 'understand') {
            const input = z.string().trim().min(8).max(1500).parse(body.text);
            const recent = await q("SELECT COUNT(*) AS n FROM ai_activity WHERE scope=? AND created>?", c.scope, new Date(Date.now() - 60000).toISOString()).first<{
                n: number;
            }>();
            if ((recent?.n || 0) >= 10)
                return json({ error: 'Please wait a minute before trying again.' }, 429);
            const secrets = env as unknown as Record<string, string>;
            const provider = secrets.OPENAI_API_KEY && secrets.OPENAI_MODEL ? openAIProvider(secrets.OPENAI_API_KEY, secrets.OPENAI_MODEL) : ruleProvider;
            const start = Date.now();
            let suggestions, used = provider.name;
            try {
                suggestions = await provider.understand(input);
                suggestions = z.array(z.object({ kind: z.enum(['offer', 'need']), category: z.string().refine(x => categories.includes(x)), title: z.string().min(3).max(100), tags: z.string().max(200) })).max(12).parse(suggestions);
                await logAI(c, provider.name, 1, Date.now() - start, null);
            }
            catch {
                await logAI(c, provider.name, 0, Date.now() - start, 'provider_or_validation_error');
                suggestions = await ruleProvider.understand(input);
                used = 'rules';
                await logAI(c, 'rules', 1, 0, null);
            }
            return json({ suggestions, provider: used });
        }
        else if (!['refresh', 'switch', 'profile', 'listing', 'remove', 'discover', 'propose', 'approve', 'start', 'complete', 'cancel', 'block'].includes(action))
            return json({ error: 'Unknown action.' }, 400);
        return json(await snapshot(c));
    }
    catch (error) {
        if (error instanceof z.ZodError)
            return json({ error: 'Please check your entries: ' + error.issues.map(i => i.path.join('.') + ' ' + i.message).join('; ') }, 400);
        if (error instanceof SyntaxError)
            return json({ error: 'Invalid request.' }, 400);
        if (error instanceof Error && error.message.includes('UNIQUE constraint'))
            return json({ error: 'Another proposal reserved this skill. Refresh your matches.' }, 409);
        console.error('Club request failed', error instanceof Error ? error.message : 'unknown');
        return json({ error: 'We could not save this change. Refresh and try again.' }, 500);
    }
}
async function logAI(c: Ctx, provider: string, success: number, latency: number, error: string | null) { await q('INSERT INTO ai_activity (id,scope,provider,request_type,success,latency,error,demo,created) VALUES (?,?,?,?,?,?,?,?,?)', id(), c.scope, provider, 'skill_understanding', success, latency, error, c.demo, now()).run(); }
async function createDemo(req: Request) { const token = id() + id(), scope = await sessionKey(token), data = seedData(scope), time = now(); const statements = [q('INSERT INTO sessions (id,actor,created) VALUES (?,?,?)', scope, data.members[0].id, time)]; for (const m of data.members)
    statements.push(q('INSERT INTO members (id,scope,name,neighborhood,bio,availability,mode,demo,created) VALUES (?,?,?,?,?,?,?,?,?)', m.id, scope, m.name, m.neighborhood, m.bio, m.availability, m.mode, 1, time)); for (const l of data.listings)
    statements.push(q('INSERT INTO listings (id,member_id,scope,kind,category,title,description,tags,hours,active) VALUES (?,?,?,?,?,?,?,?,?,1)', l.id, l.member_id, scope, l.kind, l.category, l.title, l.description, l.tags, l.hours)); await db().batch(statements); const c = { scope, actor: data.members[0].id, demo: 1 }; await saveMatches(c, findMatches(data.members, data.listings)); return json(await snapshot(c), 200, sessionCookie(req, token)); }

