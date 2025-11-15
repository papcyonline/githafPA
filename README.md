# YoMeet Website

Official landing page for YoMeet - AI-powered meeting recorder and note-taking mobile app.

## Design

- **Background**: Black (#000000)
- **Text**: White (#FFFFFF)
- **Primary Color**: Purple (#8B5CF6)
- **Secondary Color**: Green (#10B981)
- **Layout**: Single-page website with floating header

## Features

- Floating header with rounded corners
- Hero section with animated phone mockup
- Features showcase (9 key features)
- How it works section (3 steps)
- Pricing section (3 tiers)
- Download section with app store badges
- Footer with links and information

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

### Build

```bash
npm run build
```

### Export Static Site

```bash
npm run build
```

The static site will be generated in the `out/` directory.

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)
- **Animations**: Custom CSS animations

## Project Structure

```
YoMeet Web/
├── app/
│   ├── layout.js          # Root layout
│   ├── page.js            # Main landing page
│   └── globals.css        # Global styles
├── public/                # Static assets
├── .gitignore
├── next.config.js         # Next.js configuration
├── package.json
├── postcss.config.js      # PostCSS configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## Deployment

This site can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- Any static hosting service (using the `out/` folder)

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## License

All rights reserved - YoMeet 2025
