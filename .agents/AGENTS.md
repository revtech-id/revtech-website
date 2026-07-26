# Agent Rules & Guidelines

## PUBLIC UI LOCK RULE
When working on the Admin Dashboard (`/admin`), **DO NOT modify, overwrite, or reset** any global public UI components (like `components/ui/Button.tsx` or `app/globals.css`) that are used on the landing page. 

The public landing page design is **LOCKED** and strictly highly aesthetic (incorporating framer motion spring physics, specific tailwind spacing, and premium hover shadows). 

If the Admin Dashboard requires generic standard Shadcn buttons or styles, create a new separate component (e.g. `AdminButton.tsx`) or use isolated CSS modules/variables so you do not break the public site's animations and premium styles.
