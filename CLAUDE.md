# Afthonios E-Learning Website

## Project Overview

Bilingual (French/English) e-learning platform with \~250–300 courses. Built with Next.js, TypeScript, and Tailwind CSS.

### Key Features

- **Bilingual Support**: French (**default**) and English
- **Language Switcher in Header**: Toggle between **FR** and **EN** (localized routes)
- **Theme**: Site-wide **Light/Dark mode** with user preference persisted
- **Course Management**: 250–300 courses with search, filtering, and detailed views
- **User Authentication**: Login/signup system (NextAuth)
- **Payment Integration**: Stripe for subscription to courses (see "Entitlements")
- **Content Management**: Directus CMS API integration
- **Responsive & Accessible**: Modern, accessible UI with a11y-first patterns

---

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Internationalization**: `next-intl` with localized routes `/[locale]`
- **Theming**: `next-themes` (system, light, dark)
- **Backend API**: Directus CMS at `api.afthonios.com`
- **Authentication**: NextAuth.js (credentials/oauth as needed)
- **Payment**: Stripe (Checkout + Webhooks)
- **Search (optional)**: Meilisearch or Algolia for full-text & faceting
- **Analytics/Monitoring**: Plausible/GA4 + Sentry (client/server)
- **Testing**: Vitest/Jest (unit), Playwright (e2e)

---

## API Integration

- **Base URL**: `https://api.afthonios.com`
- **Public Access**: Most content publicly accessible (read-only)
- **Course Data**: Titles, descriptions, images, durations, competences, level, tags, price, availability
- **Translations**: Available in French and English via Directus translations collections

**Directus API Endpoints (examples)**

- `/items/courses` – Course listings
- `/items/courses/{id}` – Course details
- `/items/courses_competences_1` – Course–competence relations
- `/items/competences` – Competence data
- `/items/competences_translations` – Competence translations

> Define exact field lists and filters in `lib/directus.ts` and document them in the **Directus Model** section below.

---

## Project Structure

```
├── app/                         # Next.js 14+ App Router
│   ├── [locale]/                # Internationalization routing (fr, en)
│   │   ├── layout.tsx           # Root layout (wraps ThemeProvider, i18n provider)
│   │   ├── page.tsx             # Landing page
│   │   ├── courses/             # Course list & detail routes
│   │   │   ├── page.tsx         # Search/index page
│   │   │   └── [slug]/page.tsx  # Course detail
│   │   ├── auth/                # Authentication pages
│   │   ├── cours-de-la-semaine/ # Special page
│   │   ├── gestion-de-projet/   # Special page
│   │   └── nouvelle-offre/      # Special page
│   ├── api/                     # API routes (webhooks, revalidate, etc.)
│   └── globals.css              # Global styles
├── components/                  # Reusable components
│   ├── layout/
│   │   ├── Header.tsx           # Includes <LanguageSwitcher/> + <ThemeToggle/>
│   │   └── ThemeProvider.tsx    # next-themes + shadcn setup
│   ├── i18n/
│   │   └── LanguageSwitcher.tsx # Switches /[locale]/ routes
│   ├── course/                  # Course components (cards, meta blocks)
│   ├── ui/                      # shadcn/ui components
│   └── auth/                    # Auth forms
├── lib/
│   ├── directus.ts              # Directus API client
│   ├── auth.ts                  # NextAuth config
│   ├── stripe.ts                # Stripe server/client helpers
│   ├── seo.ts                   # SEO helpers (open graph, schema)
│   ├── search.ts                # Meilisearch/Algolia helpers (optional)
│   └── utils.ts                 # Misc helpers
├── types/                       # TypeScript type definitions
├── messages/                    # i18n translation files
│   ├── fr.json
│   └── en.json
└── public/                      # Static assets
```

---

## Environment Variables

```
# Core
NEXT_PUBLIC_SITE_URL=https://afthonios.com
NEXT_PUBLIC_DIRECTUS_URL=https://api.afthonios.com
NEXT_PUBLIC_DEFAULT_LOCALE=fr
NEXT_PUBLIC_AVAILABLE_LOCALES=fr,en

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Directus service token (read-only or scoped role)
DIRECTUS_STATIC_TOKEN=...
```

---

## Implementation Notes

### Language Switcher (Header)

- Implemented with `next-intl` using localized routes `/{locale}/...`.
- Switcher updates the first path segment (`fr` ↔ `en`) and pushes to the same route in the target locale.
- Persist last-selected locale (optional) in `localStorage` and/or rely on route itself.

### Light/Dark Theme

- Use `next-themes` with `attribute="class"`, `defaultTheme="system"` and `enableSystem`.
- Persist user preference; respect `prefers-color-scheme`.
- Verify color contrast and focus states in both themes.

**Scaffold**

```tsx
// components/layout/ThemeProvider.tsx
"use client";
import { ThemeProvider as NextThemes } from "next-themes";
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemes>
  );
}
```

```tsx
// components/ui/ThemeToggle.tsx
"use client";
import { useTheme } from "next-themes";
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-xl px-3 py-2 border">
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
```

```tsx
// components/i18n/LanguageSwitcher.tsx
"use client";
import { useRouter, usePathname } from "next/navigation";
const locales = ["fr", "en"] as const;
export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const switchTo = (locale: string) => {
    const parts = (pathname || "/").split("/");
    parts[1] = locale; // assumes /[locale]/...
    router.push(parts.join("/") || "/");
  };
  return (
    <div role="group" aria-label="Language" className="flex gap-1">
      {locales.map((l) => (
        <button key={l} onClick={() => switchTo(l)} className="px-2 py-1 rounded hover:underline">
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

```tsx
// components/layout/Header.tsx
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
export default function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <div className="font-semibold">Afthonios</div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
```

```tsx
// app/[locale]/layout.tsx
import ThemeProvider from "@/components/layout/ThemeProvider";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

---

## Rendering Strategy & Performance

- **Landing, Course List, Course Detail**: Prefer **SSG/ISR** with `revalidate` (e.g., 300–900s) for scale and speed.
- **Auth & Account**: **SSR** only.
- **Revalidation**: Directus webhook → Next.js route handler to revalidate specific paths.
- **Route segment caching & prefetch**: enable where safe; use `export const dynamic = "force-static"` or `revalidate` per page.
- **Edge Runtime**: optional for locale redirect and lightweight API endpoints.
- **Performance budgets**: LCP < 2.5s, INP < 200ms (mobile); monitor with Web Vitals.

---

## Search

- **Phase 1**: Client-side filtering on a paginated list (title, tags, competences).
- **Phase 2 (recommended)**: Meilisearch/Algolia index with fields: `id, slug, title_{locale}, summary_{locale}, competences, duration, level, price, tags`. Sync on Directus publish/unpublish.

---

## Image Pipeline

- Use Next/Image with Directus asset URLs or a dedicated CDN domain.
- Enforce **WebP/AVIF** output, responsive sizes, blur placeholders; store originals in Directus.
- Define `images.domains` or remotePatterns in `next.config.js`.

---

## Directus Model (to finalize)

**Collections** (proposed):

- `courses`
- `courses_translations` (Directus translations pattern)
- `competences`
- `competences_translations`
- `course_competences` (m2m)
- `pages_*` singletons (e.g., `page_freecourse`, `page_nouvelleoffre`) with `*_translations`

**Key Fields** (courses):

- `id`, `slug`, `status` (published/draft)
- `title`, `subtitle`, `summary`, `description` (localized)
- `cover_image` (file), `gallery` (files)
- `duration_minutes`, `level`, `tags` (csv or relation), `price_cents`, `currency`
- `competences` (m2m), `instructors` (m2m optional)
- `availability` (free/paid/subscription)
- `seo_title`, `seo_description`, `og_image`

**Access**

- Public role: read-only on published fields.
- Service role (token): for ISR revalidate & search indexing; scope strictly limited.

**Webhooks**

- On publish/unpublish/update: call Next revalidate endpoint; update search index.

---

## Payments & Entitlements

- **Product strategy**: either per-course prices **or** subscription tiers.
- **Checkout**: Stripe Checkout Session → success/cancel URLs localized.
- **Fulfillment**: Stripe webhook → mark entitlement (Directus `user_entitlements` or internal DB) → gate access with NextAuth session.
- **Revocation**: handle refunds/cancellations to remove entitlement.

---

## Internationalization Details

- **URL policy**: Canonical per locale (`/fr/...`, `/en/...`). Default redirect to `/fr`.
- **hreflang** and canonical tags in head; localized meta/OG.
- **Fallbacks**: when translation missing → show FR fallback or hide (define policy).
- **Slugs**: locale-aware; avoid collisions; 301 on slug change.

---

## SEO

- Localized titles/descriptions; OpenGraph images per locale.
- Sitemaps per locale and a top-level index; `robots.txt` per env.
- Structured data: Schema.org `Course` and `Product` for course detail pages.

---

## Accessibility & UX

- Keyboard navigation, visible focus rings, skip links.
- Color contrast AA in **both** themes.
- Announce route changes and theme changes to screen readers (aria-live where relevant).
- Empty states for search; skeleton loaders; consistent pagination.

---

## Error, Loading & Not-found UI

- Route-level `loading.tsx` and `error.tsx`.
- Global `not-found.tsx` with multilingual copy.

---

## Analytics & Monitoring

- **Web Analytics**: Plausible Analytics for privacy-focused insights or Google Analytics 4 for detailed tracking
- **Error Monitoring**: Sentry for client-side and server-side error tracking
- **Performance Monitoring**: Web Vitals tracking (LCP, FID, CLS) with Core Web Vitals API
- **API Monitoring**: Track Directus API response times and error rates
- **User Journey**: Track course enrollments, completion rates, payment conversions
- **A/B Testing**: Optional experimentation platform for feature rollouts

---

## Development Workflow

### Getting Started

1. **Environment Setup**:
   ```bash
   npm install
   cp .env.example .env.local
   # Configure environment variables
   npm run dev
   ```

2. **Development Commands**:
   ```bash
   npm run dev          # Start development server
   npm run build        # Build for production
   npm run start        # Start production server
   npm run lint         # Run ESLint
   npm run type-check   # Run TypeScript checks
   npm run test         # Run unit tests
   npm run test:e2e     # Run end-to-end tests
   ```

3. **Pre-commit Hooks**:
   - ESLint + Prettier for code formatting
   - TypeScript type checking
   - Commit message linting (conventional commits)

### Code Standards

- **TypeScript**: Strict mode enabled, no implicit any
- **ESLint**: Extended from Next.js + TypeScript rules
- **Prettier**: Consistent code formatting
- **Import Organization**: Absolute imports with `@/` prefix
- **Component Structure**: One component per file, named exports preferred
- **File Naming**: kebab-case for files, PascalCase for components

### Git Workflow

- **Branches**: `main` (production), `develop` (staging), feature branches
- **Commits**: Follow conventional commit format
- **PRs**: Required for all changes, automated testing + manual review
- **Releases**: Semantic versioning with automated changelogs

---

## Deployment

### Production Environment

- **Platform**: Vercel (recommended) or similar Next.js-compatible platform
- **Domain**: `https://afthonios.com`
- **CDN**: Automatic with Vercel Edge Network
- **SSL**: Automatic Let's Encrypt certificates

### Deployment Pipeline

1. **Staging**: Auto-deploy from `develop` branch
2. **Production**: Auto-deploy from `main` branch after merge
3. **Preview**: Generated for all PRs
4. **Rollback**: Available through Vercel dashboard or Git revert

### Environment-Specific Configurations

```bash
# Production
NEXT_PUBLIC_SITE_URL=https://afthonios.com
NEXTAUTH_URL=https://afthonios.com
NODE_ENV=production

# Staging
NEXT_PUBLIC_SITE_URL=https://staging.afthonios.com
NEXTAUTH_URL=https://staging.afthonios.com
NODE_ENV=production

# Development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

---

## Performance Optimization

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 800ms

### Optimization Strategies

1. **Image Optimization**:
   - Next.js Image component with responsive sizes
   - WebP/AVIF formats with fallbacks
   - Lazy loading with blur placeholders
   - CDN integration for Directus assets

2. **Code Splitting**:
   - Automatic route-based splitting
   - Dynamic imports for heavy components
   - Bundle analyzer for size monitoring

3. **Caching Strategy**:
   - ISR for course content (5-15 min revalidation)
   - Browser caching headers
   - Service worker for offline capability (optional)

4. **Database Optimization**:
   - Efficient Directus queries with field selection
   - Pagination for large datasets
   - Search index optimization

---

## Security Considerations

### Authentication & Authorization

- **NextAuth.js**: Secure session management
- **CSRF Protection**: Built-in with NextAuth
- **JWT Tokens**: Secure, httpOnly cookies
- **Role-Based Access**: Implement user roles (student, instructor, admin)

### API Security

- **Rate Limiting**: Implement for public APIs
- **Input Validation**: Zod schemas for all user inputs
- **SQL Injection**: Protected by Directus ORM
- **XSS Prevention**: React's built-in escaping + Content Security Policy

### Data Protection

- **GDPR Compliance**: Privacy policy, cookie consent, data export/deletion
- **Payment Security**: PCI compliance through Stripe
- **SSL/TLS**: Enforce HTTPS in production
- **Environment Variables**: Never commit secrets to version control

---

## Testing Strategy

### Unit Testing

- **Framework**: Vitest (faster Jest alternative)
- **Coverage**: Aim for 80%+ on critical business logic
- **Components**: React Testing Library for UI components
- **Utilities**: Test pure functions in `lib/` directory

### Integration Testing

- **API Routes**: Test Next.js API endpoints
- **Database**: Test Directus integration with mocked responses
- **Authentication**: Test NextAuth flows

### End-to-End Testing

- **Framework**: Playwright for cross-browser testing
- **Critical Paths**: User registration, course enrollment, payment flow
- **Visual Regression**: Optional screenshot comparison
- **Performance**: Lighthouse CI integration

### Testing Commands

```bash
# Unit tests
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# E2E tests
npm run test:e2e          # Run Playwright tests
npm run test:e2e:ui       # Interactive UI mode
```

---

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check TypeScript errors: `npm run type-check`
   - Verify environment variables are set
   - Clear Next.js cache: `rm -rf .next`

2. **Internationalization Issues**:
   - Verify locale files exist in `messages/`
   - Check `next-intl` configuration
   - Ensure localized routes are properly structured

3. **Directus Connection**:
   - Verify API endpoint is accessible
   - Check authentication tokens
   - Review CORS settings on Directus

4. **Theme/Styling Issues**:
   - Clear browser cache and hard refresh
   - Check Tailwind CSS configuration
   - Verify dark mode implementation

### Debug Tools

- **Next.js Debug**: Set `NODE_OPTIONS='--inspect'`
- **React DevTools**: Browser extension for component inspection
- **Network Tab**: Monitor API calls and performance
- **Lighthouse**: Performance and accessibility auditing

---

## Maintenance & Updates

### Regular Tasks

- **Dependencies**: Monthly security updates with `npm audit`
- **Next.js Updates**: Follow LTS releases, test thoroughly
- **Directus Updates**: Coordinate with backend team
- **Performance Monitoring**: Weekly Web Vitals review
- **Content Audit**: Quarterly review of course content and SEO

### Monitoring & Alerts

- **Uptime Monitoring**: Track site availability (99.9% target)
- **Error Rate**: Alert on 5xx errors > 1%
- **Performance**: Alert on Core Web Vitals degradation
- **Security**: Automated security scanning with Snyk or similar

### Backup & Recovery

- **Code**: Git repository with multiple remotes
- **Content**: Directus backup strategy (coordinate with backend)
- **User Data**: Export capabilities for GDPR compliance
- **Deployment**: Rollback procedures documented

---

## API Reference

### Next.js API Routes

- `/api/auth/*` - NextAuth.js endpoints
- `/api/stripe/webhook` - Stripe webhook handler
- `/api/revalidate` - ISR revalidation endpoint
- `/api/search` - Search API (if not using external service)

### External APIs

- **Directus**: `https://api.afthonios.com`
- **Stripe**: Checkout sessions, webhooks
- **Search**: Meilisearch/Algolia endpoints (if implemented)

### Webhook Endpoints

```typescript
// Directus webhook payload example
interface DirectusWebhook {
  event: 'items.create' | 'items.update' | 'items.delete';
  collection: string;
  key: string;
  data?: any;
}

// Stripe webhook events
interface StripeWebhook {
  type: 'checkout.session.completed' | 'invoice.payment_succeeded';
  data: {
    object: any;
  };
}
```

---

## Contributing

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Update documentation if needed
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval and tests pass

### Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] Components are accessible (ARIA labels, keyboard navigation)
- [ ] Internationalization is implemented
- [ ] Performance impact is considered
- [ ] Tests are included and passing
- [ ] Documentation is updated

### Release Process

1. Merge `develop` → `main`
2. Tag release with semantic version
3. Deploy to production
4. Monitor for issues
5. Update changelog and documentation