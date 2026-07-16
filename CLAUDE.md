# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an iGEM 2026 competition website for the **LanM-Tb** project — engineered lanmodulin variants for selective terbium (Tb³⁺) recovery from fluorescent lamp e-waste. The site showcases the project's scientific approach, design, engineering process, and results.

## Architecture

### Static Multi-Page Structure
- **Technology**: Vanilla HTML/CSS/JavaScript (no framework/build system)
- **Pages**: Each page is a standalone HTML file with shared navigation, footer, and styles
- **Core pages**: `index.html`, `description.html`, `design.html`, `engineering.html`, `results.html`, `parts.html`, `safety.html`, `human-practices.html`, `team.html`, `collaborations.html`, `attributions.html`

### Styling System
- **CSS Variables**: All theme colors, fonts, spacing defined in `:root` in `css/style.css`
- **Color Scheme**: Gray theme (`#6b7280`, `#1e293b`, `#94a3b8`) for terbium/lanmodulin scientific aesthetic
- **Fonts**: 
  - Headings: `Space Grotesk`
  - Body: `Urbanist`
  - Loaded from Google Fonts
- **Responsive**: Mobile-first breakpoints at 768px and 480px

### JavaScript Architecture
- **Common JS** (`js/main.js`): Shared across all pages
  - Mobile navigation toggle
  - Active link highlighting
  - Back-to-top button
  - Smooth scrolling
  - Intersection Observer animations
  - Counter animations for stats
- **Page-specific JS**: Inline `<script>` blocks in individual HTML files (e.g., hero canvas animation in `index.html`)

### Key Components

**Navigation** (`.navbar`):
- Fixed glassmorphic navbar with blur backdrop
- Dropdown menus for Project and Team sections
- Search modal (overlay with keyboard shortcuts)
- Mobile hamburger menu

**Hero Section** (`.hero`):
- Full-height gradient background with animated shapes
- Canvas-based animation showing lanmodulin proteins binding to terbium ions
- Parallax scrolling effects (content moves slower than scroll)

**Stats Bar** (`.stats-bar`):
- Animated counters triggered by IntersectionObserver
- Four key metrics with data-target attributes

**Card Systems**:
- `.about-card` — White cards with top accent border on hover
- `.explore-card` — Colored gradient backgrounds with overlay content
- `.card` — Standard content cards with hover lift effect

**Scroll-Driven Animations**:
- Uses CSS `animation-timeline: view()` and `scroll()` for modern scroll effects
- Fallback for older browsers using IntersectionObserver
- Classes: `.scroll-reveal`, `.scroll-reveal-left`, `.scroll-reveal-right`, `.scroll-scale`

### Search Functionality
- Modal overlay (`.search-modal`) triggered by search button
- Client-side search through `searchableContent` array
- Matches against page titles and keywords
- Close on Escape key or backdrop click

## Common Development Tasks

### Adding a New Page
1. Copy an existing inner page (e.g., `description.html`) as template
2. Update `<title>`, `.page-header` content
3. Add navigation link in all HTML files' `<nav>` sections
4. Add entry to `searchableContent` array in search script

### Modifying Theme Colors
Edit CSS variables in `css/style.css` `:root`:
```css
--color-primary: #6b7280;
--color-primary-dark: #1e293b;
--color-accent: #94a3b8;
```

### Updating Stats Bar
In `index.html`, modify `.stat-item` with `data-target` attribute:
```html
<span class="stat-number" data-target="99">0</span>
```
Counter animates from 0 to target value on scroll into view.

### Hero Canvas Animation
The hero canvas (`#heroCanvas`) in `index.html` draws:
- Lanmodulin proteins as ribbon structures with EF-hand loops
- Terbium ions as glowing particles
- Binding interactions triggered by scroll progress
- Modify variables in the canvas script to adjust particle count, colors, behavior

### Adding Sponsor Logos
Place SVG/PNG in `assets/images/` and add to `.footer-sponsors-logos`:
```html
<a href="https://..." target="_blank" rel="noopener" title="Sponsor Name">
  <img src="assets/images/logo.svg" alt="Sponsor Name">
</a>
```

## File Structure

```
web/
├── index.html           # Homepage with hero animation
├── description.html     # Project problem/solution
├── design.html          # Protein engineering approach
├── engineering.html     # DBTL cycle
├── results.html         # Data and findings
├── parts.html           # BioBrick parts
├── safety.html          # Safety protocols
├── human-practices.html # Stakeholder engagement
├── team.html            # Team members
├── collaborations.html  # Partnerships
├── attributions.html    # Credits and sponsors
├── css/
│   └── style.css        # All styles (1750+ lines)
├── js/
│   └── main.js          # Common JavaScript
└── assets/
    └── images/          # Logos and graphics
```

## Browser Compatibility

- Modern browsers: Full scroll-driven animations via CSS `animation-timeline`
- Older browsers: Fallback to IntersectionObserver-based animations
- Mobile: Responsive down to 480px with touch-friendly navigation

## iGEM Wiki Specifics

This site is designed for submission to the iGEM wiki platform:
- No external dependencies beyond Google Fonts
- All JavaScript inline or in single external file
- Sponsor logos embedded in footer
- Follows iGEM design standards while maintaining scientific aesthetic
