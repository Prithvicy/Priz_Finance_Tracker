# Priz Finance Tracker - Development Instructions

## Project Overview

This is an enterprise-grade personal finance tracking application built for both hobby use and potential commercial viability. The app enables users to track bi-weekly income, categorize expenses, and visualize spending patterns through sophisticated charts and analytics.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript (strict mode enabled)
- **Styling:** Tailwind CSS with custom design system
- **Charts:** Recharts or Chart.js for visualizations
- **Animations:** Framer Motion for smooth transitions
- **State Management:** React Context + useReducer for global state
- **Forms:** React Hook Form with Zod validation
- **Icons:** Lucide React or Heroicons

### Backend
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Auth (password protection)
- **Hosting:** Vercel (free tier)
- **Cloud Functions:** Firebase Functions (if needed for complex operations)

---

## Code Quality Standards

### File Size Limits
- **Maximum 500 lines per file** - No exceptions
- If a file approaches 400 lines, consider splitting into smaller modules
- Components should be focused and single-purpose

### Functional Programming Style
- Prefer pure functions over classes
- Use immutable data patterns (spread operators, map, filter, reduce)
- Avoid side effects in business logic
- Use composition over inheritance
- Leverage custom hooks for reusable logic

### TypeScript Standards
- Enable strict mode in tsconfig.json
- No `any` types - use proper typing or `unknown`
- Define interfaces for all data structures
- Use discriminated unions for complex state
- Export types from dedicated type files

### Component Architecture
```
components/
├── ui/           # Reusable UI primitives (Button, Card, Input)
├── charts/       # Visualization components
├── forms/        # Form components and inputs
├── layout/       # Layout components (Header, Sidebar, Navigation)
└── features/     # Feature-specific components (ExpenseCard, IncomeEntry)
```

### Naming Conventions
- **Components:** PascalCase (ExpenseCard.tsx)
- **Hooks:** camelCase with use prefix (useExpenses.ts)
- **Utilities:** camelCase (formatCurrency.ts)
- **Types:** PascalCase with descriptive names (ExpenseCategory, IncomeEntry)
- **Constants:** SCREAMING_SNAKE_CASE (MAX_CATEGORIES, DEFAULT_BUDGET)

---

## Architecture Principles

### Separation of Concerns
- Keep UI logic in components
- Keep business logic in custom hooks
- Keep data fetching in dedicated service files
- Keep utilities pure and testable

### Performance Optimization
- Use React.memo for expensive components
- Implement useMemo/useCallback appropriately
- Lazy load routes and heavy components
- Optimize images with Next.js Image component
- Minimize bundle size with tree shaking

### Mobile-First Design
- Design for mobile screens first (320px minimum)
- Use responsive breakpoints consistently:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px
- Touch-friendly tap targets (minimum 44x44px)
- Consider thumb zones for mobile navigation

### Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Focus states visible

---

## Git Commit Guidelines

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Formatting, styling changes
- `docs`: Documentation updates
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

### Rules
- Never mention AI assistants in commits
- Keep subject line under 72 characters
- Use imperative mood ("Add feature" not "Added feature")
- Reference issue numbers when applicable

### Examples
```
feat(expenses): add quick category selection buttons
fix(charts): correct monthly breakdown calculation
refactor(hooks): extract expense filtering logic
style(dashboard): improve mobile responsiveness
```

---

## Security Guidelines

### Authentication
- Implement Firebase Auth for password protection
- Use environment variables for sensitive keys
- Never expose API keys in client-side code
- Implement proper session handling

### Development Mode
- Skip authentication during local development
- Use environment variable `NEXT_PUBLIC_DEV_MODE=true`
- Ensure dev mode is NEVER enabled in production

### Data Validation
- Validate all user inputs on client and server
- Sanitize data before storing in Firestore
- Use Zod schemas for runtime type checking
- Implement rate limiting for API calls

---

## Feature Development Workflow

### Adding New Features
1. Define types/interfaces first
2. Create Firebase service functions
3. Build custom hooks for data management
4. Implement UI components
5. Add animations and polish
6. Test on mobile and desktop
7. Optimize performance

### Code Review Checklist
- [ ] File under 500 lines
- [ ] Proper TypeScript types
- [ ] Mobile responsive
- [ ] Accessible
- [ ] No console.logs in production
- [ ] Error handling implemented
- [ ] Loading states handled

---

## Finance Domain Knowledge

### Income Tracking
- Bi-weekly pay cycle ($2,448 per paycheck)
- Track actual payment dates
- Calculate monthly/yearly projections
- Handle irregular income if needed

### Expense Categories

#### Fixed Expenses (Predictable monthly costs)
- **Rent:** Monthly housing cost
- **Electricity:** Utility bill
- **Gas:** Utility bill
- **WiFi:** Internet service
- **Groceries (Walmart):** Regular grocery shopping

#### Variable Expenses (Fluctuating costs)
- **Amazon:** Online shopping
- **Eating Out:** Restaurants, takeout, delivery
- **Miscellaneous:** One-off expenses, unexpected costs

### Financial Calculations
- Monthly income = (Bi-weekly × 26) / 12
- Track spending vs. income ratio
- Calculate savings rate
- Identify spending trends

---

## UI/UX Standards

### Design Philosophy
- Clean, modern, professional aesthetic
- Whitespace for visual breathing room
- Consistent spacing using 4px/8px grid
- Subtle shadows and depth
- Smooth 200-300ms transitions

### Color System
- Primary: Professional blue/indigo tones
- Success: Green for positive (income, under budget)
- Warning: Amber/yellow for caution
- Danger: Red for over budget, alerts
- Neutral: Gray scale for text and backgrounds

### Typography
- Use system fonts or clean sans-serif (Inter, Geist)
- Clear hierarchy with font sizes
- Readable line heights (1.5-1.75 for body)
- Proper contrast ratios

### Visualization Best Practices
- Clear labels and legends
- Appropriate chart types for data
- Consistent color coding
- Interactive tooltips
- Responsive chart sizing

---

## Testing Strategy

### Unit Tests
- Test utility functions
- Test custom hooks with testing-library
- Test component rendering

### Integration Tests
- Test user flows
- Test Firebase operations (with emulator)

### Manual Testing
- Test on actual mobile devices
- Test different screen sizes
- Test slow network conditions

---

## Deployment

### Environment Variables
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_DEV_MODE=false
```

### Vercel Configuration
- Connect GitHub repository
- Set environment variables in Vercel dashboard
- Enable automatic deployments on main branch
- Set up preview deployments for PRs

---

## Quick Reference

### Common Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Key Directories
```
/app                 # Next.js app router pages
/components          # React components
/hooks               # Custom React hooks
/lib                 # Utilities and helpers
/services            # Firebase service functions
/types               # TypeScript type definitions
/styles              # Global styles and Tailwind config
```

---

## Remember

1. **Quality over speed** - Take time to do it right
2. **User experience first** - Every interaction should feel polished
3. **Mobile is primary** - Most finance apps are used on phones
4. **Performance matters** - Fast apps feel professional
5. **Consistency is key** - Follow patterns established in the codebase
6. **Think like a user** - Would you pay to use this app?
