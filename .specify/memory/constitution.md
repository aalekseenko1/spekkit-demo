<!--
SYNC IMPACT REPORT
==================
Version Change: None → 1.0.0 (Initial constitution)
Date: 2025-10-15

Modified Principles: N/A (new constitution)
Added Sections:
  - Core Principles (5 principles defined)
  - Next.js 15 Standards
  - Development Workflow
  - Governance

Removed Sections: N/A

Templates Status:
  ✅ plan-template.md - Reviewed, aligns with new constitution
  ✅ spec-template.md - Reviewed, aligns with new constitution
  ✅ tasks-template.md - Reviewed, aligns with new constitution
  ✅ agent-file-template.md - Reviewed, aligns with new constitution
  ✅ checklist-template.md - Reviewed, aligns with new constitution

Follow-up TODOs: None
-->

# Demo1 Constitution

## Core Principles

### I. Clean and Modular Code

All code MUST be clean, modular, and maintainable. This means:

- **Single Responsibility**: Each component, function, and module has one clear purpose
- **DRY (Don't Repeat Yourself)**: Extract reusable logic into shared utilities or hooks
- **Clear Naming**: Use descriptive, unambiguous names for files, functions, variables, and components
- **Minimal Coupling**: Components should depend on abstractions, not concrete implementations
- **Explicit Dependencies**: All imports must be clearly stated; no implicit global dependencies

**Rationale**: Modular code reduces cognitive load, enables parallel development, simplifies testing, and accelerates feature delivery. Clean code is easier to onboard new developers to and reduces maintenance costs.

### II. Next.js 15 App Router Architecture

All features MUST follow Next.js 15 App Router conventions and best practices:

- **App Directory Structure**: Use `app/` directory with file-based routing
- **Server Components by Default**: Components are Server Components unless explicitly marked with `'use client'`
- **Client Components When Needed**: Use `'use client'` directive only for interactivity, hooks, or browser APIs
- **Data Fetching**: Prefer native `async/await` in Server Components over legacy data fetching patterns
- **Route Handlers**: Use Route Handlers (`route.ts`) for API endpoints, not Pages API
- **Metadata API**: Use Next.js 15 Metadata API for SEO and meta tags
- **Layouts**: Leverage nested layouts for shared UI across routes

**Rationale**: Next.js 15 App Router provides improved performance through React Server Components, better developer experience with colocation, and enhanced capabilities for data fetching and streaming. Following these conventions ensures optimal bundle size, faster initial page loads, and better SEO.

### III. Type Safety First

TypeScript MUST be used throughout the codebase with strict type checking:

- **Strict Mode Enabled**: `tsconfig.json` must have `"strict": true`
- **No Implicit Any**: All functions, variables, and component props must have explicit types
- **Type Definitions**: Create clear interfaces and types for all data structures
- **Type Imports**: Use `import type` for type-only imports to optimize bundle size
- **Discriminated Unions**: Use discriminated unions for complex state management

**Rationale**: TypeScript catches errors at compile time, improves IDE support and autocomplete, serves as living documentation, and makes refactoring safer and faster.

### IV. Component Organization and Reusability

Components MUST be organized logically with clear separation of concerns:

- **Component Location**:
  - Page components in `app/` directory
  - Reusable UI components in `components/` directory
  - Feature-specific components colocated with their feature
- **Component Size**: Keep components small and focused (ideally <150 lines)
- **Props Interface**: Every component must have a clearly defined props interface
- **Composition Over Inheritance**: Build complex UIs by composing simple components
- **Barrel Exports**: Use `index.ts` files for clean component imports where appropriate

**Rationale**: Well-organized components are easier to find, test, and reuse. Clear boundaries between page-level and reusable components prevent coupling and enable scalability.

### V. Performance and Optimization

Code MUST prioritize performance and user experience:

- **Image Optimization**: Always use `next/image` for images, never plain `<img>` tags
- **Font Optimization**: Use `next/font` for automatic font optimization
- **Dynamic Imports**: Use `next/dynamic` for code-splitting large client components
- **Suspense Boundaries**: Implement React Suspense for loading states
- **Bundle Analysis**: Monitor bundle size and avoid unnecessary dependencies
- **Memoization**: Use `React.memo`, `useMemo`, and `useCallback` judiciously (only when needed)

**Rationale**: Performance directly impacts user experience, SEO rankings, and conversion rates. Next.js provides built-in optimizations that should be leveraged to deliver fast, responsive applications.

## Next.js 15 Standards

### File and Folder Conventions

All features MUST follow Next.js 15 file conventions:

- **Page Routes**: `page.tsx` or `page.jsx` for route pages
- **Layout Components**: `layout.tsx` for shared layouts
- **Loading States**: `loading.tsx` for loading UI with Suspense
- **Error Handling**: `error.tsx` for error boundaries
- **Not Found**: `not-found.tsx` for 404 pages
- **API Routes**: `route.ts` in `app/api/` for API endpoints
- **Metadata**: Export `metadata` object or `generateMetadata` function from pages

### Server vs Client Components

- **Default to Server**: Start with Server Components for better performance
- **Client Markers**: Add `'use client'` at the top of files only when necessary
- **Client Component Triggers**:
  - Using React hooks (`useState`, `useEffect`, etc.)
  - Event handlers (`onClick`, `onChange`, etc.)
  - Browser APIs (`window`, `localStorage`, etc.)
  - Third-party libraries that require client-side execution
- **Boundary Optimization**: Place `'use client'` as deep as possible in the component tree

### Data Fetching Patterns

- **Server Components**: Fetch data directly in async Server Components
- **No `useEffect` for Data**: Avoid client-side data fetching with `useEffect` unless absolutely necessary
- **Caching**: Leverage Next.js automatic caching and revalidation
- **Parallel Data Fetching**: Use `Promise.all()` to fetch data in parallel when possible
- **Streaming**: Use `loading.tsx` and Suspense for progressive rendering

## Development Workflow

### Code Quality Gates

All code MUST pass these quality gates before merging:

1. **Type Checking**: `npm run build` must complete without TypeScript errors
2. **Linting**: ESLint must pass with Next.js recommended config
3. **Build Success**: Production build (`npm run build`) must succeed
4. **Manual Testing**: Feature must be manually tested in development mode
5. **Code Review**: At least one peer review required for all changes

### Testing Philosophy (Optional)

Tests are OPTIONAL unless explicitly required by the feature specification. When tests are requested:

- **Test First**: Write tests before implementation (TDD)
- **Test Types**: Focus on integration and end-to-end tests over unit tests
- **Testing Library**: Use React Testing Library for component tests
- **Coverage Goals**: Aim for meaningful coverage of critical paths, not 100% coverage

### Documentation Requirements

- **README Updates**: Update README.md when adding major features or changing setup
- **Code Comments**: Add comments only for complex logic or non-obvious decisions
- **TypeScript as Documentation**: Rely on clear type definitions over verbose comments
- **Feature Documentation**: Document new features in specification files when applicable

## Governance

### Constitution Authority

This constitution supersedes all other development practices, guidelines, and preferences. When conflicts arise between this constitution and external resources (tutorials, blog posts, etc.), this constitution takes precedence.

### Amendment Process

1. **Proposal**: Amendments must be documented with clear rationale
2. **Review**: Team review and discussion of proposed changes
3. **Approval**: Requires consensus or designated approver sign-off
4. **Migration**: Document migration plan if amendment affects existing code
5. **Version Bump**: Update constitution version according to semantic versioning

### Version Policy

- **MAJOR (X.0.0)**: Backward-incompatible changes, principle removals, or major redefinitions
- **MINOR (0.X.0)**: New principles added or material expansions to existing guidance
- **PATCH (0.0.X)**: Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance and Review

- **PR Reviews**: All pull requests must verify compliance with constitution principles
- **Justification Required**: Any deviation from principles must be explicitly justified and documented
- **Regular Review**: Constitution should be reviewed quarterly and updated as project needs evolve
- **Enforcement**: Constitution violations must be addressed before code is merged

### Runtime Guidance

For detailed runtime development guidance and agent-specific instructions, refer to `.specify/templates/agent-file-template.md` when implementing features or working with development agents.

**Version**: 1.0.0 | **Ratified**: 2025-10-15 | **Last Amended**: 2025-10-15
