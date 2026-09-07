---
inclusion: always
---

# CSS Standards — TaskFlow

## Framework

- Use Tailwind CSS for all styling
- No custom CSS files except `globals.css` for base imports and CSS variables
- No CSS modules, styled-components, or other CSS-in-JS solutions

## Tailwind Usage

- Apply utility classes directly on elements
- Use `cn()` helper (from `lib/utils.ts`) for conditional/merged classes:
  ```tsx
  import { cn } from "@/lib/utils";
  
  <div className={cn("p-4 rounded-lg", isActive && "bg-blue-50 border-blue-200")} />
  ```
- Keep class strings readable — break onto multiple lines if longer than ~80 chars

## Responsive Design

- Mobile-first approach: base styles for mobile, then scale up
- Breakpoints:
  - `sm:` — 640px (large phones)
  - `md:` — 768px (tablets)
  - `lg:` — 1024px (desktops)
  - `xl:` — 1280px (wide desktops)
- Sidebar: visible on `lg:` and above, collapsible/hidden on smaller screens
- Kanban board: horizontal scroll on mobile, full columns on desktop
- Forms: single column on mobile, can expand on larger screens

## Color & Theming

- This project uses **Tailwind CSS v4**: configuration is CSS-first via `@import "tailwindcss"` and the `@theme` directive in `globals.css` — there is no `tailwind.config.ts`
- Use CSS variables defined in `globals.css` for theme colors
- Follow shadcn/ui color conventions:
  - `--background`, `--foreground` for base
  - `--primary`, `--secondary`, `--muted`, `--accent` for UI elements
  - `--destructive` for delete actions
- Priority colors:
  - Low: green tones (`text-green-600`, `bg-green-50`)
  - Medium: yellow/amber tones (`text-amber-600`, `bg-amber-50`)
  - High: red tones (`text-red-600`, `bg-red-50`)
- Status colors:
  - To Do: gray/slate tones
  - In Progress: blue tones
  - Completed: green tones

## Spacing

- Use Tailwind's spacing scale consistently:
  - `gap-2` (8px) between related items
  - `gap-4` (16px) between sections
  - `p-4` (16px) for card/container padding
  - `p-6` (24px) for page-level padding
  - `space-y-4` for vertical stacking of form fields
- Consistent border radius: `rounded-lg` for cards, `rounded-md` for inputs/buttons

## Typography

- Use Tailwind's font-size utilities:
  - `text-2xl font-bold` for page titles
  - `text-lg font-semibold` for section headings
  - `text-sm` for secondary/meta information
  - `text-xs` for badges and labels
- Use `text-muted-foreground` for secondary text
- Use `font-medium` for emphasis within body text

## Component Styling Patterns

### Cards
```tsx
<div className="rounded-lg border bg-card p-4 shadow-sm">
```

### Badges (Status/Priority)
```tsx
<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
```

### Buttons
- Use shadcn/ui Button variants: `default`, `secondary`, `outline`, `ghost`, `destructive`
- Don't create custom button styles

### Forms
```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input id="name" />
    <p className="text-sm text-destructive">Error message</p>
  </div>
</div>
```

## Don'ts

- Don't use `!important`
- Don't write custom CSS unless absolutely necessary
- Don't use inline `style` attributes
- Don't mix styling approaches (no CSS modules alongside Tailwind)
- Don't override shadcn/ui component internals — customize via props and className
- Don't use arbitrary values (`w-[347px]`) unless truly necessary — prefer the scale
