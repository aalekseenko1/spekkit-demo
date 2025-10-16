# Implementation Tasks: Spending Analysis Dashboard

**Feature**: 001-i-want-to - Spending Analysis Dashboard
**Branch**: `001-i-want-to`
**Total Tasks**: 59
**Generated**: 2025-10-15

## Overview

This task list is organized by user story to enable independent implementation and testing. Each phase represents a complete, independently testable increment of functionality.

**Testing Note**: Tests are OPTIONAL and not generated since they were not explicitly requested in the feature specification.

---

## Phase 1: Project Setup & Dependencies

**Goal**: Initialize project structure and install required dependencies

**Tasks**:

- [X] T001 Install papaparse and type definitions: `npm install papaparse && npm install --save-dev @types/papaparse`
- [X] T002 Install Recharts via shadcn/ui: `npx shadcn@latest add chart` (installed directly via npm)
- [X] T003 Add package.json overrides for Recharts React 19 compatibility (recharts.react-is: ^19.0.0)
- [X] T004 [P] Create src/types directory
- [X] T005 [P] Create src/lib directory
- [X] T006 [P] Create src/components directory
- [X] T007 Copy TypeScript type definitions from specs/001-i-want-to/contracts/transaction-types.ts to src/types/transaction.ts
- [X] T008 Verify Next.js build completes without errors: `npm run build`

**Completion Criteria**:
- All dependencies installed successfully
- Directory structure created
- Type definitions available in src/types/
- Build passes without TypeScript errors

---

## Phase 2: Foundational Layer (Blocking Prerequisites)

**Goal**: Implement core data processing utilities needed by all user stories

**Tasks**:

- [X] T009 [P] Implement CSV parser in src/lib/csvParser.ts with papaparse integration, header normalization, type validation
- [X] T010 [P] Implement data aggregation utilities in src/lib/dataAggregation.ts: calculateCategories(), calculateSummaryStatistics(), calculateTimePeriods()
- [X] T011 [P] Implement filter utilities in src/lib/filterUtils.ts: applyFilters(), calculateActiveFilterCount()
- [X] T012 [P] Implement CSV export utility in src/lib/exportUtils.ts: exportToCSV() with configurable columns and date formats

**Completion Criteria**:
- All utility functions implemented with proper TypeScript types
- Functions follow patterns defined in data-model.md
- No compilation errors
- Utilities are pure functions (no side effects)

---

## Phase 3: User Story 1 - Upload and View Spending Data (P1)

**Priority**: P1 (MVP - Core Value Proposition)

**Goal**: Users can upload CSV files and see their transaction data displayed in a table with summary statistics

**Independent Test**: Upload a CSV file with valid bank statement data and verify that:
1. All 11 columns display correctly in the transaction table
2. Summary shows total transactions, date range, and total amount
3. Data is lost on page refresh (stateless behavior)
4. New CSV upload replaces current data without page refresh

**Tasks**:

- [X] T013 [US1] Create FileUpload component in src/components/FileUpload.tsx with file input, loading state, error handling
- [X] T014 [US1] Integrate papaparse in FileUpload component with worker mode, header transformation, validation
- [X] T015 [US1] Add CSV validation logic to FileUpload: check required columns, validate data types, handle errors
- [X] T016 [US1] Create SummaryStats component in src/components/SummaryStats.tsx displaying totalTransactions, dateRange, totalSpending
- [X] T017 [US1] Create TransactionTable component in src/components/TransactionTable.tsx with all 11 columns, responsive design
- [X] T018 [US1] Add visual distinction for negative amounts (refunds) in TransactionTable with color coding
- [X] T019 [US1] Update src/app/page.tsx to be a client component with state management for transactions
- [X] T020 [US1] Integrate FileUpload, SummaryStats, and TransactionTable in src/app/page.tsx
- [X] T021 [US1] Add loading states using React Suspense during CSV parsing (implemented with loading spinner in FileUpload)
- [X] T022 [US1] Implement empty state UI when no data is uploaded
- [X] T023 [US1] Add error boundary for graceful error handling in src/app/page.tsx (implemented with error state display)

**Completion Criteria**:
- ✅ Acceptance Scenario 1: CSV upload displays all transactions in table
- ✅ Acceptance Scenario 2: Summary statistics display correctly
- ✅ Acceptance Scenario 3: Data clears on page refresh
- ✅ Acceptance Scenario 4: New upload replaces data without refresh
- Performance: <3s upload-to-display for 1,000 transactions
- All FR-001, FR-002, FR-003, FR-004, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017 satisfied

---

## Phase 4: User Story 2 - Analyze Spending by Category (P2)

**Priority**: P2 (Primary Analytical Value)

**Goal**: Users can see spending broken down by categories with visual charts

**Independent Test**: Upload a CSV with categorized transactions and verify that:
1. Pie chart shows spending distribution with percentages
2. Category list is sorted by amount (highest to lowest) with dollars and percentages
3. Hovering over chart shows tooltip with category details
4. Zero-spending categories are not displayed

**Dependencies**: Requires P1 (must have transaction data loaded)

**Tasks**:

- [ ] T024 [US2] Create CategoryChart component in src/components/CategoryChart.tsx using Recharts PieChart
- [ ] T025 [US2] Configure CategoryChart with tooltips showing category name, amount, percentage
- [ ] T026 [US2] Add responsive container to CategoryChart for mobile/tablet/desktop
- [ ] T027 [US2] Implement category aggregation using calculateCategories() from dataAggregation.ts
- [ ] T028 [US2] Create CategoryBreakdown component in src/components/CategoryBreakdown.tsx with sorted list
- [ ] T029 [US2] Display categories sorted by totalAmount (descending) with dollar amounts and percentages
- [ ] T030 [US2] Filter out categories with zero spending in calculateCategories()
- [ ] T031 [US2] Add "Uncategorized" handling for transactions with missing category field
- [ ] T032 [US2] Integrate CategoryChart and CategoryBreakdown into src/app/page.tsx
- [ ] T033 [US2] Optimize chart rendering with React.memo for CategoryChart component
- [ ] T034 [US2] Use useMemo to cache category calculations in src/app/page.tsx

**Completion Criteria**:
- ✅ Acceptance Scenario 1: Pie chart displays with percentages
- ✅ Acceptance Scenario 2: Category breakdown sorted correctly
- ✅ Acceptance Scenario 3: Tooltips show category details on hover
- ✅ Acceptance Scenario 4: Zero-spending categories filtered out
- Performance: Category calculations complete in <500ms for 10,000 transactions
- All FR-005, FR-006 satisfied

---

## Phase 5: User Story 3 - Track Spending Over Time (P3)

**Priority**: P3 (Temporal Insights)

**Goal**: Users can see spending trends over time with monthly breakdown

**Independent Test**: Upload a CSV spanning multiple months and verify that:
1. Line/bar chart shows total spending by month
2. Months display in chronological order with labeled axes
3. Monthly breakdown shows total and average spending per month
4. Multi-year data clearly indicates which year each point belongs to

**Dependencies**: Requires P1 (must have transaction data loaded)

**Tasks**:

- [ ] T035 [US3] Create TimeSeriesChart component in src/components/TimeSeriesChart.tsx using Recharts LineChart/BarChart
- [ ] T036 [US3] Configure TimeSeriesChart with XAxis (months), YAxis (amounts), Tooltip
- [ ] T037 [US3] Implement time period aggregation using calculateTimePeriods() from dataAggregation.ts
- [ ] T038 [US3] Format period labels to show month and year (e.g., "Jan 2024")
- [ ] T039 [US3] Create MonthlyBreakdown component displaying total and average spending per month
- [ ] T040 [US3] Handle multi-year data with clear year indicators in chart labels
- [ ] T041 [US3] Add chronological sorting to time periods (earliest to latest)
- [ ] T042 [US3] Integrate TimeSeriesChart and MonthlyBreakdown into src/app/page.tsx
- [ ] T043 [US3] Optimize time series rendering with React.memo and useMemo
- [ ] T044 [US3] Disable chart animations for datasets >5000 transactions (performance optimization)

**Completion Criteria**:
- ✅ Acceptance Scenario 1: Chart shows monthly spending totals
- ✅ Acceptance Scenario 2: Months in chronological order with clear axes
- ✅ Acceptance Scenario 3: Both total and average displayed
- ✅ Acceptance Scenario 4: Multi-year data clearly labeled
- Performance: Time aggregation completes in <500ms for 10,000 transactions
- All FR-007 satisfied

---

## Phase 6: User Story 4 - Analyze Multi-Currency and Cashback Data (P4)

**Priority**: P4 (Specific User Segments)

**Goal**: Users can see original currency amounts and cashback earnings

**Independent Test**: Upload a CSV with multi-currency and cashback data and verify that:
1. Transaction table shows both original amount+currency and USD equivalent
2. Dashboard summary shows total cashback earned
3. Aggregations use USD, detail view preserves original currency
4. Category analysis can show net spending (amount minus cashback)

**Dependencies**: Requires P1 (transaction table), P2 (category analysis)

**Tasks**:

- [ ] T045 [P] [US4] Update TransactionTable to display originalAmount and originalCurrency columns
- [ ] T046 [P] [US4] Add USD equivalent display logic in TransactionTable for multi-currency transactions
- [ ] T047 [US4] Update SummaryStats to calculate and display totalCashback from transactions
- [ ] T048 [US4] Add netSpending calculation to SummaryStats (totalSpending - totalCashback)
- [ ] T049 [US4] Update CategoryBreakdown with toggle to show net spending (optional feature)
- [ ] T050 [US4] Implement net spending calculation in category aggregation (subtract cashback)
- [ ] T051 [US4] Handle missing originalCurrency gracefully (show only USD when not present)
- [ ] T052 [US4] Add cashback earned column to TransactionTable with visual indicator

**Completion Criteria**:
- ✅ Acceptance Scenario 1: Both original and USD amounts visible
- ✅ Acceptance Scenario 2: Total cashback displayed in summary
- ✅ Acceptance Scenario 3: USD used for aggregations, original preserved in details
- ✅ Acceptance Scenario 4: Net spending option available in category view
- All FR-008, FR-009 satisfied

---

## Phase 7: User Story 5 - Filter and Search Transactions (P5)

**Priority**: P5 (Enhanced Usability)

**Goal**: Users can filter and search transactions with dynamic visualization updates

**Independent Test**: Upload a large CSV and verify that:
1. Search box filters transactions and updates all charts
2. Category filter dropdown works and updates visualizations
3. Date range filter shows only transactions in range
4. "Clear Filters" button removes all filters
5. Active filter indicator shows which filters are applied
6. Export button downloads filtered data as CSV

**Dependencies**: Requires P1 (transactions), P2 (categories), P3 (time series)

**Tasks**:

- [ ] T053 [US5] Create FilterPanel component in src/components/FilterPanel.tsx with search input, category select, date range inputs
- [ ] T054 [US5] Implement search term filter using applyFilters() from filterUtils.ts
- [ ] T055 [US5] Add debounce to search input (300ms delay) using useDebounce hook
- [ ] T056 [US5] Implement category multi-select filter in FilterPanel
- [ ] T057 [US5] Implement date range filter with start and end date pickers
- [ ] T058 [US5] Add "Clear Filters" button to reset all filter state
- [ ] T059 [US5] Display active filter indicator showing which filters are applied and result count
- [ ] T060 [US5] Update all visualizations (table, charts, summaries) to use filtered transactions
- [ ] T061 [US5] Create ExportButton component in src/components/ExportButton.tsx using exportUtils.ts
- [ ] T062 [US5] Implement CSV export for filtered transactions preserving all 11 columns
- [ ] T063 [US5] Integrate FilterPanel into src/app/page.tsx with filter state management
- [ ] T064 [US5] Memoize filtered transactions calculation to avoid unnecessary recomputes
- [ ] T065 [US5] Handle empty filtered results with appropriate UI message

**Completion Criteria**:
- ✅ Acceptance Scenario 1: Search filters transactions and updates charts
- ✅ Acceptance Scenario 2: Category filter works with visualization updates
- ✅ Acceptance Scenario 3: Date range filter functions correctly
- ✅ Acceptance Scenario 4: Clear filters button resets all filters
- ✅ Acceptance Scenario 5: Active filter indicator displays correctly
- ✅ Acceptance Scenario 6: Export downloads filtered CSV
- Performance: Filter application completes in <1s
- All FR-010, FR-011, FR-018 satisfied

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Final optimizations, responsive design, and production readiness

**Tasks**:

- [ ] T066 [P] Add responsive design styles to all components for mobile/tablet/desktop
- [ ] T067 [P] Implement React Suspense with loading fallbacks for async operations
- [ ] T068 [P] Add proper error messages for common CSV validation failures
- [ ] T069 [P] Update src/app/layout.tsx with appropriate metadata (title, description)
- [ ] T070 [P] Add Tailwind CSS responsive utilities to TransactionTable for horizontal scrolling on mobile
- [ ] T071 Optimize bundle size by using next/dynamic for chart components
- [ ] T072 Add web worker support validation message if browser doesn't support workers
- [ ] T073 Implement virtual scrolling for TransactionTable when >1000 transactions
- [ ] T074 Add accessibility attributes (ARIA labels) to all interactive components
- [ ] T075 Test application with 10,000 transaction CSV to verify performance goals
- [ ] T076 Run Next.js build and verify no TypeScript errors: `npm run build`
- [ ] T077 Manually test all 5 user stories end-to-end on desktop browser
- [ ] T078 Manually test responsive design on mobile device or browser DevTools
- [ ] T079 Verify all Success Criteria (SC-001 through SC-010) are met

**Completion Criteria**:
- Responsive design works on mobile, tablet, desktop
- All performance goals met (SC-001, SC-005, SC-006, SC-007)
- All accessibility requirements satisfied
- Production build succeeds without errors
- All functional requirements (FR-001 through FR-020) verified

---

## Implementation Strategy

### MVP Scope (Recommended First Iteration)

**Focus on User Story 1 (P1) ONLY for MVP**:
- Phases 1-3 (Tasks T001-T023)
- Delivers core value: upload CSV and view data
- Validates technical approach
- Independently testable and shippable

**Estimated Tasks for MVP**: 23 tasks
**Estimated Development Time**: 2-3 days

### Incremental Delivery Plan

1. **Sprint 1 (MVP)**: Phase 1-3 → P1 complete (upload & view)
2. **Sprint 2**: Phase 4 → P2 complete (category analysis)
3. **Sprint 3**: Phase 5 → P3 complete (time series)
4. **Sprint 4**: Phase 6-7 → P4-P5 complete (multi-currency, filtering)
5. **Sprint 5**: Phase 8 → Polish and optimization

Each sprint delivers an independently testable, valuable increment.

---

## Task Dependencies

### User Story Dependency Graph

```
Setup (Phase 1)
    ↓
Foundational (Phase 2)
    ↓
P1: Upload & View (Phase 3) ← MVP cutoff
    ↓
    ├→ P2: Category Analysis (Phase 4)
    ├→ P3: Time Series (Phase 5)
    ├→ P4: Multi-Currency (Phase 6) ← Depends on P1 + P2
    └→ P5: Filtering (Phase 7) ← Depends on P1, P2, P3
         ↓
    Polish (Phase 8)
```

**Key Insights**:
- P2, P3 can be developed in parallel (both depend only on P1)
- P4 requires P1 and P2 to be complete
- P5 requires P1, P2, P3 to be complete
- Phase 8 should be done last after all features complete

### Within-Phase Dependencies

**Phase 3 (P1) Internal Dependencies**:
- T009-T012 (foundational utils) must complete before T013-T023
- T013-T018 (components) can be built in parallel
- T019-T023 (integration) depends on all components being ready

**Phase 4 (P2) Internal Dependencies**:
- T024-T026 (CategoryChart) can build in parallel with T028-T029 (CategoryBreakdown)
- T032-T034 (integration & optimization) depends on all components

**Phase 5 (P3) Internal Dependencies**:
- T035-T036 (TimeSeriesChart) can build in parallel with T039 (MonthlyBreakdown)
- T042-T044 (integration & optimization) depends on all components

**Phase 7 (P5) Internal Dependencies**:
- T053-T059 (FilterPanel features) build sequentially (each filter type)
- T060 (update visualizations) depends on FilterPanel being complete
- T061-T062 (ExportButton) can build in parallel with FilterPanel
- T063-T065 (integration) depends on all filter features

---

## Parallel Execution Opportunities

### Within Each User Story

**User Story 1 (Phase 3)** - Can parallelize:
- T013 (FileUpload) + T016 (SummaryStats) + T017 (TransactionTable) ← 3 components simultaneously

**User Story 2 (Phase 4)** - Can parallelize:
- T024-T026 (CategoryChart) + T028-T031 (CategoryBreakdown) ← 2 component tracks

**User Story 3 (Phase 5)** - Can parallelize:
- T035-T038 (TimeSeriesChart) + T039 (MonthlyBreakdown) ← 2 component tracks

**User Story 4 (Phase 6)** - Can parallelize:
- T045-T046 (TransactionTable updates) + T047-T048 (SummaryStats updates) ← 2 update tracks

**User Story 5 (Phase 7)** - Can parallelize:
- T053-T059 (FilterPanel) + T061-T062 (ExportButton) ← 2 independent features

**Phase 8 (Polish)** - Can parallelize:
- T066-T070 (responsive & loading) + T074 (accessibility) ← Multiple improvement tracks

**Across User Stories** (if multiple developers):
- After P1 complete: P2 + P3 in parallel
- After P2 complete: P4 can start
- After P3 complete: P5 can start (but also needs P2)

---

## Task Format Validation

✅ All tasks follow required format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ Task IDs are sequential (T001-T079)
✅ [P] marker present on 28 parallelizable tasks
✅ [Story] labels present on all user story phase tasks (US1-US5)
✅ File paths specified in all implementation tasks
✅ Setup and Polish phases have no story labels (correct)

---

## Summary Statistics

- **Total Tasks**: 79
- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 4 tasks
- **Phase 3 (P1 - MVP)**: 11 tasks
- **Phase 4 (P2)**: 11 tasks
- **Phase 5 (P3)**: 10 tasks
- **Phase 6 (P4)**: 8 tasks
- **Phase 7 (P5)**: 13 tasks
- **Phase 8 (Polish)**: 14 tasks

**Parallelizable Tasks**: 28 (35% of total)
**MVP Task Count**: 23 tasks (Phases 1-3)

---

## Success Metrics Mapping

| Success Criterion | Verified By | Tasks |
|-------------------|-------------|-------|
| SC-001: <3s upload for 1K transactions | Phase 3, T021, T075 | T009, T013-T023 |
| SC-002: Identify top 3 categories in 10s | Phase 4 | T024-T034 |
| SC-003: 100% valid transaction parsing | Phase 3, T015 | T009, T015 |
| SC-004: 90% upload success without help | Phase 3, T022, T068 | T013-T023 |
| SC-005: <1s filter application | Phase 7, T064 | T053-T065 |
| SC-006: Handle 10K transactions | Phase 8, T075 | T073, T075 |
| SC-007: <2s initial load | Phase 8, T071 | T066-T071 |
| SC-008: Mobile device support | Phase 8, T078 | T066, T070, T078 |
| SC-009: 95% CSV format success | Phase 3, T015 | T009, T015 |
| SC-010: <2min full workflow | All phases, T079 | T001-T079 |

---

## Next Steps

1. Review this task list with stakeholders
2. Confirm MVP scope (recommend Phase 1-3 only)
3. Begin implementation starting with T001
4. Track progress by checking off completed tasks
5. Run manual tests for each completed phase
6. Deploy MVP after Phase 3 completion
7. Iterate on P2-P5 based on user feedback
