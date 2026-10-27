import type { Member, Listing } from './model.ts';
import { tasks } from './model.ts';
const people = [
    ['Marcus', 'Corktown', 'auto', 'website,garden', 'Weekend', 'both'], ['Jasmine', 'Corktown', 'website', 'auto', 'Weekend', 'both'], ['Derek', 'Southwest Detroit', 'garden', 'website', 'Weekend', 'both'],
    ['Alicia', 'Midtown', 'tutoring', 'computer', 'Evening', 'both'], ['Ray', 'Midtown', 'computer', 'tutoring', 'Evening', 'both'],
    ['Monique', 'West Village', 'logo', 'garden', 'Weekend', 'both'], ['Anthony', 'West Village', 'photo', 'logo', 'Weekend', 'both'], ['Sofia', 'Eastern Market', 'cooking', 'photo', 'Weekend', 'both'], ['Nia', 'West Village', 'garden', 'photo', 'Weekend', 'both'],
    ['Elena', 'Bagley', 'spanish', 'sewing', 'Evening', 'both'], ['Theo', 'Bagley', 'sewing', 'spanish', 'Evening', 'both'], ['Imani', 'North End', 'guitar', 'cooking', 'Weekend', 'both'], ['Owen', 'North End', 'cooking', 'guitar', 'Weekend', 'both'], ['June', 'Rosedale Park', 'pottery', 'piano', 'Morning', 'in-person'], ['Sam', 'Midtown', 'network', 'pottery', 'Morning', 'remote']
];
export function seedData(scope: string) { const members: Member[] = []; const listings: Listing[] = []; for (const [name, neighborhood, offer, needs, availability, mode] of people) {
    const id = scope + ':' + name.toLowerCase();
    members.push({ id, scope, name, neighborhood, bio: `A fictional ${neighborhood} neighbor. Happy to share what I know and learn something new.`, availability, mode, demo: 1 });
    for (const [kind, keys] of [['offer', offer], ['need', needs]])
        for (const key of keys.split(',')) {
            const t = tasks[key];
            listings.push({ id: id + ':' + kind + ':' + key, member_id: id, scope, kind: kind as 'offer' | 'need', category: t.category, title: t.title, description: key === 'auto' ? 'Learn basic vehicle checks and maintenance planning. No safety-critical repair work.' : `A focused, friendly session for ${t.title.toLowerCase()}. Agree on the details together.`, tags: key + ' ' + t.aliases.join(' '), hours: 2, active: 1 });
        }
} return { members, listings }; }
