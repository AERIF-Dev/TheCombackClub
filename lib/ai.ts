import { tasks } from './model.ts';
import { taskKeys } from './matching.ts';
export type Suggestion = {
    kind: 'offer' | 'need';
    category: string;
    title: string;
    tags: string;
};
export interface AIProvider {
    name: string;
    understand(text: string): Promise<Suggestion[]>;
}
export const ruleProvider: AIProvider = { name: 'rules', async understand(text) { const parts = text.split(/\b(?:but|need|looking for|want help)\b/i); const result: Suggestion[] = []; parts.forEach((p, i) => { for (const key of taskKeys(p)) {
        const t = tasks[key];
        result.push({ kind: i === 0 ? 'offer' : 'need', category: t.category, title: t.title, tags: key });
    } }); return result; } };
// Optional server-only provider. A separately authorized API key is required;
// ChatGPT sign-in does not supply inference credentials.
export function openAIProvider(key: string, model: string): AIProvider { return { name: 'openai', async understand(text) { const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(20000), body: JSON.stringify({ model, instructions: 'Extract only skills explicitly offered or requested. Do not invent commitments. Return JSON with a suggestions array of {kind: offer or need, category, title, tags}. Use these categories: Technology, Design, Garden, Learning, Photography, Cooking, Automotive, Home, Language, Music.', input: text, text: { format: { type: 'json_object' } }, max_output_tokens: 600 }) }); if (!response.ok)
        throw new Error('provider_error'); const data = await response.json() as {
        output?: {
            content?: {
                type: string;
                text?: string;
            }[];
        }[];
    }; const out = data.output?.flatMap(x => x.content || []).filter(x => x.type === 'output_text').map(x => x.text).join('') || ''; return JSON.parse(out).suggestions; } }; }
