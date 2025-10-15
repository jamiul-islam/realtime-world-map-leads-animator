# 🌍 Admin-Driven Global Unlock

A minimalist web application featuring an interactive world map that displays global progress toward an unlock goal. The experience centers around a luminous visual element that responds to real-time admin-controlled data.

## 🎨 Design

Modern, award-winning aesthetic with a sophisticated color palette:
- **Deep navy/midnight blue** backgrounds for elegance
- **Vibrant cyan/teal** accents for energy and focus  
- **Electric purple** highlights for dynamic visual interest
- **Soft white/cream** text for clarity
- **Glass-morphism** effects and smooth gradients for depth

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Supabase account with project credentials

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Application Structure

### Public Homepage (`/`)
The main page displays:
- **Global progress percentage** in the header
- **Interactive world map** showing country activation states
- **Real-time updates** via Supabase subscriptions
- **Unlock reveal** when 100% is reached

### Admin Login (`/login`)
Secure authentication for administrators:
- Magic link email authentication
- Role-based access control
- Only users with `admin` role can access the control panel

### Admin Dashboard (`/modify`)
Protected admin interface for controlling the application:
- **Country activation updates** (increment or set absolute values)
- **Global energy updates** (increment or set percentage)
- **Real-time synchronization** with public page
- **Audit trail** for all admin actions

## 🎛️ Admin Dashboard Features

### Country Update Form

Update individual country activation counts to control map visualization.

| Feature | Description | Validation |
|---------|-------------|------------|
| **Country Selector** | Searchable dropdown with 195 UN countries | Must select valid country |
| **Update Mode** | Toggle between Increment and Absolute Set | - |
| **Increment Value** | Add to current activation count | Must be positive integer |
| **Absolute Set Value** | Overwrite activation count | Must be non-negative integer (≥ 0) |
| **Optional Note** | Add context for audit trail | Max 500 characters |

**Glow Band Thresholds:**
- **Band 0 (Off)**: 0 activations - No glow
- **Band 1 (Warm)**: 1-2 activations - Warm amber glow
- **Band 2 (Bright)**: 3-5 activations - Bright amber glow  
- **Band 3 (Radiant)**: 6+ activations - Radiant amber glow

### Global Energy Form

Control the overall progress percentage displayed on the public page.

| Feature | Description | Validation |
|---------|-------------|------------|
| **Preset Increments** | Quick buttons: +1%, +2%, +5%, +10% | Cannot exceed 100% |
| **Absolute Set** | Set exact percentage value | Must be 0-100 |
| **Optional Note** | Add context for audit trail | Max 500 characters |
| **Unlock Blocking** | After reaching 100%, increments are disabled | Absolute set still allowed before unlock |

**Important:** When energy reaches exactly 100%, the system automatically unlocks and displays exclusive content on the public page.

## 🔒 Security & Access Control

### Authentication
- Magic link authentication via Supabase Auth
- No password storage required
- Session timeout: 24 hours

### Authorization
- Row-Level Security (RLS) policies enforce access control
- Public users: Read-only access to locker and country states
- Admin users: Full write access to all tables
- All admin actions logged with email and timestamp

### Admin Role Setup
Admins must be manually configured in Supabase:
1. Navigate to Supabase Dashboard → Authentication → Users
2. Find the user account
3. Update the `role` field to `admin` in the `auth.users` table

## 📊 Database Schema

### Tables

**locker_state**
- `energy_percentage` (0-100): Global progress percentage
- `is_unlocked` (boolean): Whether unlock goal is reached
- `last_updated` (timestamp): Last modification time

**country_states**
- `country_code` (ISO 3166-1 alpha-2): Two-letter country code
- `activation_count` (integer): Number of activations
- `glow_band` (0-3): Calculated visual intensity level
- `last_updated` (timestamp): Last modification time

**audit_log**
- `admin_email`: Email of admin who made the change
- `action_type`: Type of action (country_increment, country_set, energy_increment, energy_set)
- `subject`: Country code or 'global_energy'
- `delta_or_value`: Change description (e.g., '+3', 'set to 45')
- `note`: Optional admin note
- `created_at`: Timestamp of action

## 🔄 Real-Time Updates

The application uses Supabase Realtime subscriptions for instant synchronization:
- Changes made in the admin dashboard appear on the public page within 1-2 seconds
- No page refresh required
- Smooth animations for state transitions

## 🎯 Performance Optimizations

- **Component memoization** prevents unnecessary re-renders
- **Code-splitting** for admin routes reduces initial bundle size
- **Lazy loading** for non-critical components
- **Optimized animations** using GPU-accelerated transforms
- **Efficient state management** with Zustand

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## 🌐 Deployment

### Vercel Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import project in Vercel dashboard

3. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE`

4. Deploy

### Post-Deployment Checklist

- [ ] Verify public page loads and displays initial state
- [ ] Test admin login with magic link
- [ ] Confirm admin updates reflect on public page
- [ ] Check real-time connection is established
- [ ] Verify RLS policies block unauthorized writes
- [ ] Test unlock sequence at 100%

## 📝 Usage Guidelines

### For Admins

1. **Login**: Navigate to `/login` and enter your admin email
2. **Check Email**: Click the magic link sent to your inbox
3. **Update Countries**: Use the Country Update Form to modify activation counts
4. **Update Energy**: Use the Global Energy Form to control overall progress
5. **Monitor**: Watch changes appear on the public page in real-time
6. **Logout**: Click the Logout button when finished

### Best Practices

- Add notes to updates for better audit trail
- Use increments for gradual progress
- Use absolute set for corrections or resets
- Monitor the public page to verify changes
- Avoid rapid successive updates (respect 15-second timeout)

## 🐛 Troubleshooting

### Updates Not Appearing
- Check browser console for errors
- Verify Supabase connection in Network tab
- Confirm admin role is set correctly
- Check RLS policies are enabled

### Authentication Issues
- Verify email is correct
- Check spam folder for magic link
- Ensure admin role is set in Supabase
- Try clearing browser cache and cookies

### Performance Issues
- Check network connection
- Verify Supabase project is active
- Monitor browser console for errors
- Consider reducing animation complexity

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For technical support or questions, contact your system administrator.

---

Built with ❤️ using Next.js, Supabase, and Framer Motion
