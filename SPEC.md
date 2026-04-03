# Freelancer Revenue Tracker - Specification

## 1. Project Overview

**Project Name:** Freelancer Revenue Tracker
**Type:** Single-page web application (React)
**Core Functionality:** Income tracking dashboard for freelancers to log payments, visualize revenue trends, and monitor client earnings
**Target Users:** Freelancers, independent contractors, solo professionals

---

## 2. UI/UX Specification

### Layout Structure

- **Header** (80px): App title, "Add Income" button
- **Add Income Form**: Collapsible form with source, amount, client, project, date fields
- **Dashboard Grid**: 3-column metric cards (This Month, Quarterly, Total)
- **Main Content**: Two-column layout (Monthly Chart + Top Clients / Recent Entries)
- **Responsive Breakpoints:**
  - Desktop: 1024px+ (full 3-column dashboard, side-by-side sections)
  - Tablet: 768px-1023px (2-column dashboard)
  - Mobile: <768px (single column, stacked layout)

### Visual Design

**Color Palette:**
- Background: `#F9FAFB` (light gray)
- Surface: `#FFFFFF` (white cards)
- Border: `#E5E7EB`
- Primary: `#059669` (emerald green - for positive/earnings)
- Primary Hover: `#047857`
- Text Primary: `#111827`
- Text Secondary: `#6B7280`
- Text Muted: `#9CA3AF`
- Accent Positive: `#10B981` (green)
- Accent Negative: `#EF4444` (red)
- Accent Warning: `#F59E0B` (amber)

**Typography:**
- Font Family: System fonts (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`)
- Headings: Bold, 24px (h1), 18px (h2), 16px (h3)
- Body: 14px regular
- Small/Labels: 12px
- Font weights: 400 (regular), 500 (medium), 700 (bold)

**Spacing System:**
- Page padding: 24px
- Card padding: 24px
- Grid gap: 24px
- Element gap: 12px, 16px

**Visual Effects:**
- Card shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Border radius: 12px (cards), 8px (buttons, inputs)
- Transitions: 200ms ease-in-out

### Components

**Add Income Form:**
- Grid layout: source dropdown, amount input, client input, project input, date picker
- Submit button: emerald green
- Cancel toggle

**Metric Cards:**
- Label (gray, small)
- Value (large, bold)
- Subtext (comparison, stats)

**Monthly Revenue Chart:**
- Horizontal bar chart (6 months)
- Bars colored emerald
- Month label below each bar

**Top Clients List:**
- Ranked by total earnings
- Numbered badge, client name, total amount

**Recent Entries List:**
- Scrollable list (max 10 visible)
- Shows: client, project, source, date, amount
- Delete button per entry

---

## 3. Functionality Specification

### Core Features

1. **Income Entry**
   - Add new income with: source (Upwork/Fiverr/Direct/Other), amount, client name, project name, date
   - Validate required fields (amount, client, date)
   - Auto-save to LocalStorage

2. **Revenue Dashboard**
   - This Month: Current calendar month total with % change vs last month
   - Quarterly: Current quarter total with estimated tax (25%)
   - Total: All-time earnings with project count

3. **Monthly Revenue Chart**
   - Display last 6 months of revenue
   - Auto-scale based on highest month

4. **Client Breakdown**
   - Top 5 clients by total earnings
   - Ranked list with total revenue per client

5. **Recent Entries**
   - Chronological list of recent entries (newest first)
   - Delete individual entries

6. **Data Persistence**
   - LocalStorage with key `freelancer-revenue-data`
   - Auto-save on any change
   - Load on app init

### User Interactions

- Click "Add Income" → Toggle form visibility
- Fill form + Submit → Add entry, close form, update dashboard
- Click Delete on entry → Remove from list
- Change month filter → Dashboard updates automatically

### Edge Cases

- Empty state: "No entries yet" / "No clients yet"
- First month with no data: Show 0 with 100% increase
- Very large numbers: Format with commas

---

## 4. Acceptance Criteria

1. ✅ App loads with dashboard showing all revenue metrics
2. ✅ Can add new income entries with all required fields
3. ✅ Entries persist in LocalStorage (survives refresh)
4. ✅ Monthly revenue chart displays last 6 months
5. ✅ Top clients ranked by total earnings
6. ✅ Recent entries displayed chronologically
7. ✅ Can delete individual entries
8. ✅ Responsive layout works on mobile/tablet/desktop
9. ✅ Build completes successfully to dist/ folder
