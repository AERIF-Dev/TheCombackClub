export type Member = {
    id: string;
    scope: string;
    name: string;
    neighborhood: string;
    bio: string;
    availability: string;
    mode: string;
    demo: number;
};
export type Listing = {
    id: string;
    member_id: string;
    scope: string;
    kind: 'offer' | 'need';
    category: string;
    title: string;
    description: string;
    tags: string;
    hours: number;
    active: number;
};
export type Edge = {
    from: string;
    to: string;
    offer: Listing;
    need: Listing;
    score: number;
    reasons: string[];
};
export type Match = {
    id: string;
    type: 'direct' | 'circle';
    score: number;
    edges: Edge[];
    explanation: string;
};
export const categories = ['Technology', 'Design', 'Garden', 'Learning', 'Photography', 'Cooking', 'Automotive', 'Home', 'Language', 'Music'];
export const neighborhoods = ['Corktown', 'Southwest Detroit', 'Midtown', 'West Village', 'North End', 'Bagley', 'Rosedale Park', 'Eastern Market'];
export const tasks: Record<string, {
    category: string;
    aliases: string[];
    title: string;
}> = {
    website: { category: 'Technology', aliases: ['website', 'web development', 'web design', 'wordpress'], title: 'Build a simple website' },
    computer: { category: 'Technology', aliases: ['computer', 'pc', 'laptop', 'troubleshooting'], title: 'Computer troubleshooting' },
    network: { category: 'Technology', aliases: ['network', 'wifi', 'wi-fi', 'router'], title: 'Home network setup' },
    logo: { category: 'Design', aliases: ['logo', 'graphic design', 'branding'], title: 'Design a business logo' },
    garden: { category: 'Garden', aliases: ['garden', 'landscaping', 'yard', 'weeding'], title: 'Garden maintenance' },
    tutoring: { category: 'Learning', aliases: ['tutoring', 'tutor', 'math', 'algebra'], title: 'Math tutoring' },
    photo: { category: 'Photography', aliases: ['photography', 'photos', 'photograph', 'portraits'], title: 'Small business photography' },
    cooking: { category: 'Cooking', aliases: ['cooking', 'cook', 'recipes', 'meal prep'], title: 'Cooking lessons' },
    auto: { category: 'Automotive', aliases: ['automotive', 'car', 'vehicle', 'maintenance'], title: 'Basic vehicle care guidance' },
    sewing: { category: 'Home', aliases: ['sewing', 'mending', 'alterations'], title: 'Clothing mending' },
    spanish: { category: 'Language', aliases: ['spanish', 'español'], title: 'Spanish conversation' },
    guitar: { category: 'Music', aliases: ['guitar'], title: 'Beginner guitar lessons' },
    piano: { category: 'Music', aliases: ['piano'], title: 'Piano lessons' },
    pottery: { category: 'Home', aliases: ['pottery', 'ceramics'], title: 'Pottery basics' }
};
