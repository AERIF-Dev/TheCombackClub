import fs from 'node:fs';
// Frame the original exchange symbol without resampling or altering its pixels.
const logo = fs.readFileSync(new URL('../public/branding/comeback-club-logo.png', import.meta.url));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="488 -50 560 560"><rect x="488" y="-50" width="560" height="560" rx="280" fill="#F8F3E9"/><image width="1536" height="1024" href="data:image/png;base64,${logo.toString('base64')}"/></svg>`;
fs.writeFileSync(new URL('../public/favicon.svg', import.meta.url), svg);
