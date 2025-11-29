# Toolify

A modern, multi-language collection of practical online tools built with Next.js. Toolify provides developers and users with a comprehensive set of utilities for encoding, encryption, image processing, text manipulation, and more.

## 🌟 Features

- **16+ Practical Tools**: JSON formatter, Base64 encoder, URL encoder, MD5 hasher, password generator, timestamp converter, QR code generator, image compressor, color picker, Markdown editor, word counter, IP lookup, unit converter, and more
- **Multi-language Support**: English, Chinese (Simplified), and Japanese
- **Modern UI**: Clean, responsive design built with Tailwind CSS
- **Tag-based Organization**: Tools organized by tags for easy discovery
- **SEO Optimized**: Dynamic sitemap and robots.txt generation
- **Server-Side Rendering**: Fast page loads with Next.js SSR
- **Accessible**: Built with Headless UI for better accessibility

## 🛠️ Available Tools

### Development Tools
- **JSON Formatter**: Format and validate JSON data
- **Regex Tester**: Test regular expressions
- **UUID Generator**: Generate unique identifiers

### Encoding & Decoding
- **Base64 Encoder/Decoder**: Encode and decode Base64 strings
- **URL Encoder/Decoder**: Encode and decode URL strings

### Encryption & Security
- **MD5 Hasher**: Generate MD5 hash from text
- **Password Generator**: Generate secure random passwords

### Time Tools
- **Timestamp Converter**: Convert between timestamps and human-readable dates

### Image Tools
- **QR Code Generator**: Generate QR codes with customizable colors and sizes
- **Image Compressor**: Compress images online with adjustable quality

### Design Tools
- **Color Picker**: Select colors and convert between HEX, RGB, HSL, HSV formats

### Text Tools
- **Markdown Editor**: Real-time Markdown editing with live preview
- **Word Count**: Count characters, words, lines, paragraphs, and sentences

### Network Tools
- **IP Lookup**: Query IP address information (geolocation, ISP, timezone)

### Calculation Tools
- **Unit Converter**: Convert between various units (length, weight, temperature, volume, area, speed, time, data)

### Format Conversion
- **VLESS to Clash**: Convert VLESS configuration to Clash format

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/toolify.git
cd toolify
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file (optional):
```bash
cp .env.example .env.local
```

Edit `.env.local` and set your base URL:
```
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

```bash
pnpm build
pnpm start
```

## 🏗️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Headless UI](https://headlessui.com/)
- **Markdown**: [marked](https://marked.js.org/)
- **QR Code**: [qrcode](https://www.npmjs.com/package/qrcode)
- **Encryption**: [crypto-js](https://cryptojs.gitbook.io/)
- **Typography**: [@tailwindcss/typography](https://tailwindcss.com/docs/plugins/typography)

## 📁 Project Structure

```
toolify/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── [lang]/            # Language routes
│   │   │   ├── page.tsx       # Homepage
│   │   │   └── tools/         # Tool pages
│   │   ├── api/               # API routes
│   │   ├── robots.ts          # Dynamic robots.txt
│   │   └── sitemap.ts         # Dynamic sitemap.xml
│   ├── components/            # React components
│   │   ├── common/           # Shared components
│   │   └── home/             # Homepage components
│   ├── data/                 # Data files
│   │   └── tools.ts          # Tools and tags data
│   ├── locales/              # Translation files
│   │   ├── en.ts            # English
│   │   ├── zh.ts            # Chinese
│   │   └── ja.ts            # Japanese
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── public/                    # Static assets
└── package.json
```

## 🌍 Internationalization

Toolify supports multiple languages through the `[lang]` route parameter:
- `/en` - English
- `/zh` - Chinese (Simplified)
- `/ja` - Japanese

Translation files are located in `src/locales/`. Each tool can have its own translation keys.

## 🔧 Adding a New Tool

1. Add tool data to `src/data/tools.ts`:
```typescript
{
  id: 17,
  name: "myTool",
  icon: "🔧",
  description: "myTool",
  path: "/tools/my-tool",
  tags: ["development"]
}
```

2. Add translations to `src/locales/*.ts`:
```typescript
myTool: {
  name: "My Tool",
  description: "Tool description",
  // ... other translations
}
```

3. Create the tool page at `src/app/[lang]/tools/my-tool/page.tsx`
4. Create the client component at `src/app/[lang]/tools/my-tool/MyToolClient.tsx`

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

Built with ❤️ using Next.js
