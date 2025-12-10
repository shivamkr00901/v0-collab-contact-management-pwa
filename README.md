# Collab - Shared Contact Management PWA

A collaborative contact management Progressive Web App that lets groups share and sync contacts in real-time.

## Features

- **Group Management**: Create and manage multiple contact groups
- **Real-time Sync**: Changes sync instantly across all group members
- **Contact CRUD**: Add, edit, view, and delete contacts
- **Import/Export**: Import contacts from CSV/JSON or export your groups
- **PWA Support**: Install as a native app on iOS and Android
- **Secure**: JWT authentication with encrypted passwords
- **Offline Ready**: Access contacts even without internet
- **Gen Z UI**: Modern, vibrant design with smooth interactions

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (via Neon)
- Environment variables configured

### Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run database migrations:
   \`\`\`bash
   npm run db:init
   \`\`\`

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

Visit `http://localhost:3000` to get started.

## API Documentation

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Groups

- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group

### Contacts

- `GET /api/groups/:id/contacts` - List contacts in group
- `POST /api/groups/:id/contacts` - Add contact to group
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Import/Export

- `POST /api/contacts/import` - Import contacts from file
- `POST /api/contacts/export` - Export group contacts

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Auth**: JWT + bcrypt
- **UI**: shadcn/ui components
- **Styling**: Tailwind CSS with custom theme

## File Structure

\`\`\`
app/
├── api/                 # API routes
├── auth/                # Auth pages
├── groups/              # Group pages
├── dashboard/           # Dashboard page
└── settings/            # Settings page

components/
├── ui/                  # shadcn components
├── add-contact-dialog/  # Add contact form
├── create-group-dialog/ # Create group form
├── export-contacts/     # Export functionality
└── import-contacts/     # Import functionality

lib/
├── db.ts               # Database client
├── auth.ts             # Auth utilities
└── websocket-context.ts # WebSocket provider
\`\`\`

## License

MIT
