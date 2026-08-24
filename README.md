# Aqua Fishing Academy ERP — Frontend (Phase 1: Project Foundation + Phase 2: Sales CRM & Lead Management)

React + Vite + Tailwind CSS frontend implementing the Phase 1 scope (authentication screens,
role-based dashboard shell, and a full user & role management interface) plus the Phase 2 scope
(Sales CRM & Lead Management: lead capture, assignment, pipeline, follow-ups, customer management,
conversion, interaction history, activity timeline, sales team management, payment link generation,
and sales performance tracking).

## Tech Stack

- React 18 + Vite 5
- React Router 6
- Tailwind CSS 3
- Axios (with automatic access-token refresh)
- react-hot-toast for notifications
- lucide-react for icons

## Getting Started

```bash
cd frontend
npm install
cp .env.example .env
# set VITE_API_URL to your backend URL if different from the default

npm run dev
```

App runs at `http://localhost:5173`. Make sure the backend is running at the URL configured in
`VITE_API_URL` (default `http://localhost:5000/api/v1`) and that you've run `npm run seed` on the
backend to create the default Super Admin login.

## Folder Structure

```
frontend/
├── index.html
├── tailwind.config.js        # Design tokens (colors, fonts, motion)
└── src/
    ├── main.jsx
    ├── App.jsx                 # Route definitions
    ├── index.css                # Tailwind layers + component classes
    ├── context/
    │   └── AuthContext.jsx      # Auth state, login/logout, permission checks
    ├── constants/
    │   └── crm.js                # Phase 2 — lead sources, pipeline stages, activity types
    ├── services/
    │   ├── api.js                 # Axios instance + token refresh interceptor
    │   ├── authService.js
    │   ├── userService.js
    │   ├── roleService.js
    │   ├── leadService.js          # Phase 2
    │   ├── customerService.js      # Phase 2
    │   ├── followUpService.js      # Phase 2
    │   ├── activityService.js      # Phase 2
    │   ├── paymentService.js       # Phase 2
    │   ├── salesTeamService.js     # Phase 2
    │   └── salesPerformanceService.js  # Phase 2
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.jsx
    │   │   ├── Navbar.jsx
    │   │   └── DashboardLayout.jsx
    │   ├── common/
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── Loader.jsx
    │   │   ├── StatusBadge.jsx
    │   │   └── ConfirmModal.jsx
    │   ├── users/
    │   │   └── UserFormModal.jsx
    │   └── crm/                      # Phase 2
    │       ├── LeadFormModal.jsx
    │       ├── AssignLeadModal.jsx
    │       ├── ConvertLeadModal.jsx
    │       ├── FollowUpFormModal.jsx
    │       ├── FollowUpList.jsx
    │       ├── ActivityTimeline.jsx
    │       ├── LogInteractionModal.jsx
    │       ├── PaymentLinkModal.jsx
    │       ├── PaymentLinksList.jsx
    │       ├── LeadCard.jsx
    │       ├── StageBadge.jsx
    │       ├── SourceBadge.jsx
    │       └── PaymentStatusBadge.jsx
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        ├── ForgotPassword.jsx
        ├── Dashboard.jsx
        ├── Users.jsx
        ├── Roles.jsx
        ├── Unauthorized.jsx
        ├── NotFound.jsx
        └── crm/                       # Phase 2
            ├── Leads.jsx
            ├── LeadDetail.jsx
            ├── Pipeline.jsx
            ├── Customers.jsx
            ├── CustomerDetail.jsx
            ├── SalesTeam.jsx
            └── SalesPerformance.jsx
```

## Design System

A distinct visual identity was built for the academy rather than a generic admin template:

- **Palette** — Marine navy (`#0E2A3F`) for the sidebar and dark surfaces, Tide teal (`#0FA3A3`)
  as the primary brand accent, Sandbar gold (`#E3A857`) as a secondary accent, and Mist
  (`#EFF6F5`) as the app background.
- **Typography** — `Outfit` for display/headings, `Inter` for body and UI text, `JetBrains Mono`
  reserved for tabular/technical data in later phases.
- **Signature details** — a hook-shaped active indicator on sidebar navigation, a wave-line
  divider and ripple gradient on the login screen, and a subtle drifting animation on the
  "Phase" wave icon.

## Routing & Access Control

- `ProtectedRoute` redirects unauthenticated users to `/login` and users without a required
  permission to `/unauthorized`.
- `AuthContext.hasPermission(permission)` checks the current user's role permissions
  (Super Admin always passes) and is used both for route guarding and for hiding UI actions
  (e.g. the "Add user" button) the user isn't allowed to perform.

## Phase 2 — Sales CRM & Lead Management

Everything in the priority scope is implemented on the frontend:

- **Lead capture from multiple sources** — `Leads.jsx` + `LeadFormModal` (Website, Referral, Social
  Media, Walk-in, Phone Inquiry, Email Campaign, Event, Advertisement, Other)
- **Lead assignment & distribution** — `AssignLeadModal`, assign/reassign to any sales rep
- **Lead pipeline management & sales stages** — `Pipeline.jsx`, a drag-and-drop Kanban board across
  New → Contacted → Qualified → Proposal Sent → Negotiation → Won/Lost
- **Follow-up management** — `FollowUpFormModal` / `FollowUpList`, scheduled calls, emails, meetings,
  WhatsApp, site visits, with overdue/complete tracking
- **Customer management** — `Customers.jsx` / `CustomerDetail.jsx`
- **Lead conversion process** — `ConvertLeadModal`, one-click lead → customer conversion
- **Customer interaction history & activity timeline** — `ActivityTimeline` + `LogInteractionModal`,
  shared across leads and customers
- **Sales team management** — `SalesTeam.jsx`, workload and conversion rate per rep
- **Payment link generation** — `PaymentLinkModal` / `PaymentLinksList` on the customer profile
- **Sales performance tracking** — `SalesPerformance.jsx`, revenue by rep, leads by source, pipeline
  distribution, conversion rate

All of it is wired through `App.jsx` with permission-gated routes (`crm:leads:view`,
`crm:pipeline:update`, `crm:customers:view`, `crm:sales-team:view`, `crm:performance:view`, etc.) and
a new "Sales CRM" section in the sidebar.

**Expected backend endpoints** (REST, same conventions as Phase 1's `/users` and `/roles`):
`/leads`, `/leads/:id/assign`, `/leads/:id/stage`, `/leads/:id/convert`, `/leads/pipeline`,
`/customers`, `/follow-ups`, `/activities`, `/payment-links`, `/sales-team`,
`/sales-performance/overview|by-rep|by-source|by-stage`.

## Next Phases

Pages, layout, and the API/service layer are structured so Phase 3 and beyond can be added as new
`pages/`, `components/`, and `services/` files without reworking auth, routing, or the design system.
