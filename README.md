# Money Manager

A personal finance application built with Next.js that integrates with Plaid to help you track your spending and income.

## Features

- 🔒 Secure authentication with GitHub via Next-Auth
- 🏦 Bank account integration through Plaid
- 📊 Monthly transaction visualization
- 💰 Income and expense tracking
- 📈 Daily financial activity charts
- 🎨 Modern UI with shadcn/ui components
- 🔄 Environment-aware Plaid integration (sandbox/production)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: Next-Auth (Auth.js)
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Banking Integration**: Plaid API
- **Charts**: Recharts
- **Date Handling**: Luxon

## Getting Started

### Prerequisites

- Node.js 18+ and bun
- PostgreSQL database
- Plaid account with API credentials
- GitHub OAuth application

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Plaid
NEXT_PUBLIC_PLAID_ENV=sandbox # or 'development' or 'production'
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
NEXT_PUBLIC_PLAID_REDIRECT_URI=http://localhost:3000/oauth-redirect

# Auth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
AUTH_URL=http://localhost:3000
AUTH_SECRET=your_auth_secret

# Database
DATABASE_URL=your_postgres_connection_string
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/money-manager.git
cd money-manager
```

2. Install dependencies:

```bash
bun install
```

3. Push the database schema:

```bash
bunx drizzle-kit push
```

4. Start the development server:

```bash
bun run dev
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages and layouts
│   ├── api/               # API routes
│   │   ├── auth/         # Next-Auth configuration
│   │   └── plaid/        # Plaid integration endpoints
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── balance-chart.tsx # Transaction visualization
│   ├── plaid-link.tsx    # Plaid connection button
│   └── ui/               # shadcn/ui components
└── lib/                  # Shared utilities
    ├── auth/             # Authentication configuration
    └── db/               # Database configuration and schema
```

## Features in Detail

### Authentication

- GitHub OAuth integration
- Secure session management
- Protected API routes and pages

### Banking Integration

- Secure bank account linking through Plaid
- Transaction synchronization
- Multiple account support
- Environment-aware token management (sandbox/production)
- Automatic environment detection and filtering

### Transaction Management

- Monthly transaction view
- Income and expense categorization
- Daily transaction breakdown
- Visual representation of financial activity

### Data Visualization

- Daily income/expense bar charts
- Monthly statistics
- Transaction categorization

### Environment Management

The application automatically manages Plaid tokens based on the current environment (sandbox/production):

- Tokens are stored with their associated environment
- Only tokens from the current environment are used for fetching transactions
- Seamless transition between sandbox and production environments
- Prevents mixing of test and production data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
