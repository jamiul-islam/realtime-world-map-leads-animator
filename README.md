# REALTIME World Map Business Leads Animator App

A minimalist, one-page web application featuring a luminous Locker and interactive world map that displays global progress toward an unlock goal.

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with custom design tokens (charcoal, gold, amber palette)
- **Zustand** for state management
- **Framer Motion** for animations
- **react-svg-worldmap** for world map visualization
- **Supabase** for backend (database, auth, real-time)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=your-service-role-key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components (to be created)
├── lib/                   # Utilities and helpers (to be created)
├── store/                 # Zustand store (to be created)
└── types/                 # TypeScript types (to be created)
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Design Tokens

Custom color palette configured in `tailwind.config.ts`:
- **Charcoal**: Background and neutral tones
- **Gold**: Highlights and accents
- **Amber**: Glow effects and warm tones
