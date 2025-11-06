# Roofing AI Chatbot

A comprehensive Next.js 14 AI chatbot system for roofing companies with emergency detection, lead qualification, and appointment scheduling.

## Features

- 🚨 **Emergency Detection**: Real-time scanning for urgent keywords
- 💬 **Chat Interface**: Real-time messaging with typing indicators
- 📋 **Lead Qualification**: Multi-step form for capturing lead information
- 📅 **Appointment Scheduling**: Dynamic time slot selection
- 📊 **Admin Dashboard**: Lead management and analytics
- 🔒 **Password Protection**: Secure dashboard access

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hooks
- Local Storage (conversation persistence)
- JSON file storage (leads)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Dashboard

Access the admin dashboard at [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

Default password: `admin123` (set via `DASHBOARD_PASSWORD` environment variable)

## Project Structure

```
roofing-ai-chatbot/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main chat interface
│   ├── dashboard/
│   │   └── page.tsx        # Admin dashboard
│   └── api/
│       ├── chat/route.ts    # Chat endpoint
│       ├── leads/route.ts   # Leads management
│       └── auth/route.ts   # Dashboard auth
├── components/
│   ├── ChatInterface.tsx
│   ├── MessageBubble.tsx
│   ├── EmergencyDetector.tsx
│   ├── LeadQualification.tsx
│   ├── SchedulingWidget.tsx
│   └── AdminDashboard.tsx
├── lib/
│   ├── ai-responses.ts     # AI response logic
│   ├── database.ts         # Lead storage
│   └── utils.ts            # Utility functions
└── types/
    └── index.ts            # TypeScript types
```

## Environment Variables

Create a `.env.local` file:

```env
DASHBOARD_PASSWORD=your_password_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## PWA Icons Setup

To enable full PWA functionality, add the following icon files to the `/public` folder:

1. **icon-192x192.png** - 192x192 pixels (required for PWA)
2. **icon-512x512.png** - 512x512 pixels (required for PWA)
3. **apple-icon.png** - 180x180 pixels (for iOS home screen)
4. **og-image.png** - 1200x630 pixels (for social media sharing)

After adding these files, uncomment the icon references in `app/layout.tsx` and update `public/manifest.json` to include the icons array.

### Quick Icon Generation

You can use online tools like:
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [Can I Use](https://caniuse.com/) for icon format support

Or create them manually:
- Use a design tool (Figma, Photoshop, etc.)
- Export as PNG with the specified dimensions
- Place in the `/public` folder

## Features in Detail

### Emergency Detection

Automatically detects emergency keywords:
- leak, emergency, water, flooding, urgent
- Priority routing for emergencies
- Different conversation flows based on emergency level

### Lead Qualification

Multi-step form collects:
- Name
- Phone number
- Address
- Problem description
- Emergency level (1-5 scale)
- Preferred contact method

### Appointment Scheduling

- Dynamic time slots (today + tomorrow)
- 2-hour emergency windows for urgent cases
- Next-day general appointments
- Confirmation system

### Admin Dashboard

- View all captured leads
- Filter by emergency status
- Export to CSV
- Update lead status
- Delete leads
- Analytics overview

## Data Storage

- **Conversations**: Stored in browser localStorage
- **Leads**: Stored in JSON files in `/data` directory (can be upgraded to a database)

## Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:
- Primary: `#2563eb`
- Emergency: `#dc2626`

### AI Responses

Modify `lib/ai-responses.ts` to customize chatbot responses and behavior.

## License

MIT

