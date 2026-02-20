# Partner Directory

A reusable, filterable card grid built with **Vue 3** (Composition API). Designed for partner/integration directories, app marketplaces, or any catalog that needs multi-dimensional filtering.

## Features

- **Multi-select checkbox filters** — Region and category filters with "Select All" toggle
- **Relevance scoring** — Items score higher when they match more active filters; tiebreaker within the same priority tier
- **Paid placement support** — Priority ordering ensures sponsored items appear first regardless of score
- **URL parameter sync** — Filter state is reflected in the URL for shareable/bookmarkable views
- **Browser history support** — Back/forward navigation restores filter state
- **Load-more pagination** — Configurable page size with progressive loading
- **Loading skeleton** — Animated placeholder cards during initial data load
- **Accessible** — Checkbox filters use `role="checkbox"`, `aria-checked`, and keyboard navigation

## Architecture

```
index.html              → HTML shell + Vue template
directory-app.js        → Vue 3 app (Composition API) — filtering, scoring, pagination
directory-data.js       → Data layer (regions, categories, items)
directory-grid.css      → Grid layout, card styles, filter checkboxes, skeleton animation
landing-page-module.js  → Standalone utility module for landing pages:
                           - Region-based server routing (US/EU)
                           - GDPR/privacy consent detection
                           - Auth redirect flows (legacy token + SSO/nonce)
                           - Country detection (URL param → form → cookie)
                           - Form enhancement utilities
```

## Quick Start

```bash
# Clone and serve locally
git clone https://github.com/cgarza1992/partner-directory.git
cd partner-directory
python3 -m http.server 8080
# Open http://localhost:8080
```

No build step required — vanilla JS + Vue 3 CDN.

## Scoring System

Each item receives a **relevance score** based on how many active filters it matches:

| Filter Type | Score |
|---|---|
| Each matching region | +1 |
| Each matching category | +1 |

Items are sorted by:
1. **Priority** (ascending) — lower number = paid/sponsored placement
2. **Score** (descending) — higher relevance within the same priority tier

Open the browser console to see real-time scoring breakdowns on every filter change.

## Customization

### Data Source

Replace `directory-data.js` with your own data. The expected shapes:

```js
// Regions (filter group 1)
const initialRegions = [
  { name: 'Display Name', slug: 'url-safe-slug' },
];

// Categories (filter group 2)
const initialCategories = [
  { name: 'Display Name', slug: 'url-safe-slug' },
];

// Items
const initialItems = [
  {
    id: 1,
    title: 'Item Name',
    link: 'https://...',
    regions: ['slug-1', 'slug-2'],
    thumbnail: 'https://...' || false,
    excerpt: 'Short description...',
    categories: [{ name: 'Name', slug: 'slug' }],
    priority: 1,  // lower = shown first
    platform: [],
  },
];
```

### Theming

Override the CSS custom property:

```css
:root {
  --accent-color: #your-brand-color;
}
```

### Landing Page Module

`landing-page-module.js` is a standalone IIFE module for registration/auth landing pages. Configure it by setting values on `landingPageModule.appSettings`:

```js
landingPageModule.appSettings.registerServer = 'https://app.example.com';
landingPageModule.appSettings.registerServerEU = 'https://eu.example.com';
```

## Tech Stack

- Vue 3 (Composition API, CDN — no build required)
- Vanilla CSS (no framework dependency)
- Zero npm dependencies

## License

MIT
