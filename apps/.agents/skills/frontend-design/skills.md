---
name: ProjectLo Frontend Design
description: A comprehensive guide for designing and implementing the frontend user interface of ProjectLo, a college marketplace for buying, selling, and renting college projects.
---

# ProjectLo Frontend Design

This skill provides the core design system, architectural guidelines, and UX philosophy for building the ProjectLo frontend. ProjectLo is a professional, human-designed marketplace where college students can buy, sell, and rent academic projects.

## When to use this skill

Activate this skill when:
- Designing or implementing a new page, component, or layout for ProjectLo.
- Styling user interfaces using Tailwind CSS within the ProjectLo Next.js architecture.
- Making UX decisions regarding marketplace features, product discovery, or seller trust.
- Implementing responsive layouts or interactive elements.
- Reviewing or refactoring existing UI code for consistency and professionalism.

## How to use it

### 1. Material Kit React as the primary visual reference
Use [devias-io/material-kit-react](https://github.com/devias-io/material-kit-react) as a structural and layout reference. It provides an excellent baseline for professional dashboards, spacing hierarchies, and clean layout patterns.

### 2. How to inspect and learn from the repository
When you need inspiration for a layout, review the Material Kit React source code for its DOM structure, spacing ratios, and responsive behavior. Observe how they handle sidebars, top navigations, data tables, and form structures.

### 3. How to adapt Material Kit patterns instead of copying them
**CRITICAL: Do not copy the Material UI (MUI) code.** ProjectLo uses Tailwind CSS. You must translate the structural concepts (e.g., how a card is divided into a header, body, and footer) into idiomatic Tailwind CSS utility classes. Do not bring in MUI dependencies, themes, or its specific component APIs.

### 4. ProjectLo's own visual identity
**CRITICAL NON-AI AESTHETIC REQUIREMENT:** 
ProjectLo MUST look like it was created by a professional human product designer, not an AI. 
**AVOID ALL OF THE FOLLOWING:**
- Excessive gradients
- Generic purple/blue "AI" aesthetics
- Glassmorphism or heavy blur effects
- Glowing backgrounds or neon borders
- Decorative abstract blobs
- Excessive rounded cards (pill-shaped everything)
- Giant, hollow marketing headings
- Meaningless statistics counters
- Repetitive, template-like card grids
- Unnecessary vector illustrations
- Excessive, uncontrolled whitespace
- Random visual effects on hover
- Placing absolutely every section inside a bordered card

Instead, rely on solid colors, crisp typography, intentional negative space, and clear content hierarchies.

### 5. Typography
Use a modern, highly readable sans-serif typeface (e.g., Inter or Roboto). 
- Use font weights purposefully: regular (`font-normal`) for body text, medium (`font-medium`) for interactive elements, and semibold (`font-semibold`) for headings.
- Avoid giant marketing headings. Ensure heading sizes step down logically (H1 -> H2 -> H3).

### 6. Spacing
Use Tailwind's spacing scale systematically. Maintain consistent gaps (e.g., `gap-4`, `gap-6`) in flex/grid layouts. Padding within components must be balanced (e.g., `p-6` for standard cards, `px-4 py-2` for buttons).

### 7. Colors
Define a restrained, professional palette.
- **Primary:** A strong, trustworthy brand color.
- **Neutral:** A deep slate or gray for text (`text-gray-900`, `text-gray-600`), and subtle grays for borders and backgrounds (`bg-gray-50`, `border-gray-200`).
- **Semantic:** Standard red (error), green (success), and amber (warning) strictly reserved for their specific statuses.

### 8. Borders
Use borders to create subtle separation between elements, not to box everything in. Rely on `border border-gray-200`. Avoid heavy, dark borders unless creating high-contrast interactive states.

### 9. Border radius
Keep border radii conservative. Use `rounded-md` or `rounded-lg` for cards, inputs, and buttons. Do not use `rounded-full` (pill shapes) for structural elements, reserving them only for badges or avatars.

### 10. Shadows
Use shadows very sparingly to denote elevation (e.g., dropdown menus, modals, or floating headers). Use Tailwind's `shadow-sm` for interactive cards and `shadow-md` for dropdowns. Avoid excessive, deep, or colored shadows.

### 11. Buttons
Keep buttons functional and clear.
- **Primary:** Solid brand color background, white text.
- **Secondary:** White background, gray border, gray text.
- **Ghost/Tertiary:** No background, brand or gray text, slight background on hover.

### 12. Inputs and forms
Inputs must have clear borders, visible focus rings (e.g., `focus:ring-2 focus:ring-primary-500`), and associated labels. Keep forms single-column where appropriate, grouping related fields logically. 

### 13. Cards
Cards should group related content. A product card or dashboard widget must have a clear internal hierarchy (header, body, footer). Do not overuse cards; sometimes simple padded sections separated by lines are cleaner.

### 14. Navigation
Use top navs for customer-facing marketplace pages and a sidebar layout for user/admin dashboards. Navigation links must clearly indicate active states (e.g., heavier font weight, distinct text color, or a subtle indicator line).

### 15. Headers
Marketplace headers should feature a prominent search bar, category navigation, and quick access to the user's cart, orders, and profile. Keep it sticky if it aids user workflow.

### 16. Authentication pages
**Google OAuth Only.** Do not implement username/password forms, password resets, or alternative logins. The auth layout should be clean, centered, and minimal. Display a single, prominent "Continue with Google" button. 

### 17. Marketplace pages
Prioritize product discovery. Use intuitive filter sidebars (categories, price, format) and clear, structured grids for project listings. 

### 18. Product cards
Cards must show:
- High-quality project thumbnail
- Clear, descriptive title (truncated gracefully)
- Price (and rental price, if applicable)
- Seller name and minimal trust indicators (e.g., star rating)
Do not overload the card. 

### 19. Product detail pages
Focus on clarity. The layout should feature a large image gallery, a prominent pricing/action box on the right (Buy/Rent), detailed descriptions, technical specs, and a seller information section.

### 20. Seller profiles
Build trust without excessive gamification. Display the seller's overall rating, number of completed transactions, joined date, and a grid of their active listings.

### 21. Buyer dashboards
Provide a clean summary of active orders, current rentals, and recently viewed items. Use data tables or list items to display purchase history cleanly.

### 22. Seller dashboards
Focus on actionable metrics. Provide clear views of pending orders, active listings, earnings, and messages. Refer to Material Kit React's dashboard layouts for structural inspiration.

### 23. Orders
Display order status clearly using semantic badges (e.g., Pending, Delivered, Disputed). Show transaction timelines and clear actions (e.g., "Download Files", "Contact Seller").

### 24. Rentals
Clearly distinguish rentals from purchases. Highlight rental expiration dates, terms, and the status of the return/revocation process.

### 25. Chat
Implement a clean, two-pane messaging layout (contacts on the left, messages on the right). Ensure timestamps and message status (read/unread) are clear. 

### 26. Reviews and seller ratings
Present reviews chronologically with the buyer's name, star rating, and text. Implement simple aggregations (e.g., "4.8 out of 5 based on 120 reviews").

### 27. Notifications
Keep notifications accessible via a dropdown in the header or a dedicated page. Distinguish unread notifications with a subtle background color (`bg-blue-50`) or dot indicator.

### 28. Admin dashboard
Focus on data density. Utilize complex data tables, filtering, and bulk actions for user management, dispute resolution, and transaction monitoring.

### 29. Tables
For dashboards and admin views, use clean data tables. Ensure column headers are distinct, rows have subtle hover states (`hover:bg-gray-50`), and pagination is clear. Use Material Kit's table spacing as a reference.

### 30. Modals/dialogs
Use modals for focused, transient tasks (e.g., confirming a purchase, reporting an issue). They must include a clear backdrop overlay, a close button, and keep focus trapped within the modal.

### 31. Loading states
Use subtle skeletons (`animate-pulse` on gray blocks) for initial page loads of content grids. Use small, non-obtrusive spinners for inline actions (e.g., saving a form). 

### 32. Empty states
When a list, order history, or search result is empty, show a clean, simple message. Avoid generic, oversized vector illustrations. Use a subtle icon, a clear heading, and a primary action button (e.g., "Browse Marketplace").

### 33. Error states
Keep errors human-readable. Use inline red text for form validation. For page-level errors, present a clear explanation and a way to recover (e.g., "Refresh Page" or "Return Home").

### 34. Responsive design
Do not just shrink the desktop version. Ensure intentional breakpoint behaviors using Tailwind's `sm:`, `md:`, `lg:`, and `xl:` prefixes. Grids should change column counts (1 -> 2 -> 4). 

### 35. Mobile layouts
Convert sidebars into hamburger menus or bottom navigation bars on mobile. Move complex filter panels into mobile drawers. Ensure all tap targets (buttons, links) are at least 44x44px.

### 36. Accessibility
Ensure semantic HTML (`<nav>`, `<main>`, `<article>`). Maintain high color contrast. All interactive elements MUST have `focus:` states for keyboard navigation. Use `aria-labels` for icon-only buttons. Support screen-reader friendly structures.

### 37. Animations
Use animations for feedback only, not decoration. Examples of acceptable animations:
- A crisp 150ms ease-in-out transition on button hovers.
- A subtle slide-in for modals.
- A spinner rotating on a loading button.
Do not use bouncy, springy, or infinite floating animations.

### 38. Image handling
Project images are the core of the marketplace. Use `next/image` for optimization. Ensure images have a consistent aspect ratio (e.g., 16:9 or 4:3) using Tailwind's `aspect-video` or `object-cover`. 

### 39. Component reuse
Do not duplicate UI code. Search the existing codebase before building.
Use or build reusable components such as:
- `ProductCard`
- `ProductGallery`
- `SellerCard`
- `SellerBadge`
- `Rating`
- `SearchBar`
- `FilterPanel`
- `CategoryCard`
- `OrderStatusBadge`
- `RentalStatusBadge`
- `NotificationItem`
- `UserMenu`
- `EmptyState`
- `LoadingState`
- `ErrorState`

### 40. Design consistency
Maintain strict separation of business logic and presentation. Keep components pure where possible. Ensure that spacing, fonts, and colors are perfectly uniform across all pages.

### 41. UI review/checklist before considering a page complete
Before finishing any frontend implementation, verify against this checklist:
- [ ] Does this look like ProjectLo (a college marketplace)?
- [ ] Does it look like a human-designed, professional product?
- [ ] Does it strictly avoid generic AI-generated aesthetics (no unnecessary gradients, blur, glowing, blobs, etc.)?
- [ ] Is the visual hierarchy clear (typography and spacing)?
- [ ] Is spacing consistent and derived from the Tailwind scale?
- [ ] Are components reused rather than duplicated?
- [ ] Does the layout work beautifully on mobile, tablet, and desktop?
- [ ] Are loading, error, and empty states explicitly handled?
- [ ] Is the page accessible (focus states, contrast, semantic HTML)?
- [ ] Is the UI consistent with the rest of ProjectLo?
- [ ] Is every decorative element purposeful?
- [ ] Does the page prioritize marketplace functionality (search, filter, buy, trust) over decoration?