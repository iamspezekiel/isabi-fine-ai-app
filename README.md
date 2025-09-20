# IsabiFine AI - Your Health Companion in Nigeria

> Quickly find health facilities, get AI-powered health insights, and manage your health journey in Nigeria. Your reliable health partner.

## 🏥 Overview

IsabiFine AI is a comprehensive health companion application designed specifically for Nigeria. It helps users locate nearby health facilities, provides AI-powered health insights, and offers emergency assistance features. The application combines modern web technologies with Google's Genkit AI framework to deliver a seamless healthcare navigation experience.

## ✨ Key Features

### 🗺️ Interactive Map View
- **Multiple View Modes**: 2D Map, Satellite, 3D Earth, and Street View
- **Real-time Location**: GPS-based user location detection
- **Facility Markers**: Visual indicators for different types of health facilities
- **Directions Integration**: Get directions to selected facilities

### 🏥 Health Facility Finder
- **Comprehensive Database**: Hospitals, clinics, pharmacies, diagnostic centers, and more
- **Detailed Information**: Contact details, services, opening hours, and facility images
- **Smart Search**: Find facilities by type, location, or services offered
- **Facility Types Supported**:
  - Hospitals
  - Clinics
  - Pharmacies
  - Diagnostic Centers
  - Dental Clinics
  - Optical Centers
  - Gyms
  - Spas
  - Specialist Centers
  - Physiotherapy Clinics

### 🚨 Emergency Mode
- **Quick Access**: Instant connection to nearest emergency facilities
- **Critical Situation Handling**: Streamlined interface for urgent medical needs
- **Emergency Dialog**: Guided assistance for emergency situations

### 🤖 AI-Powered Features
- **Health Insights**: AI-driven health recommendations and information
- **Smart Suggestions**: Personalized facility recommendations
- **Powered by Google Genkit**: Advanced AI capabilities for health assistance

### 🌐 Multi-language Support
- **Language Provider**: Built-in internationalization support
- **Nigerian Context**: Tailored for Nigerian healthcare system and culture

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icon library

### AI & Backend
- **Google Genkit**: AI framework for intelligent features
- **Firebase**: Backend services and hosting
- **React Hook Form**: Form management
- **Geolocation API**: Location services

### UI Components
- **Custom Component Library**: Built with Radix UI primitives
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components
- **Toast Notifications**: User feedback system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account (for deployment)
- Google AI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd isabiFine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://isabi-fine-ai.vercel.app`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:start` - Start Genkit production server

## 📁 Project Structure

```
src/
├── ai/                     # AI configuration and Genkit setup
│   └── genkit.ts          # Genkit AI initialization
├── app/                   # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page component
├── components/            # Reusable UI components
│   ├── emergency/         # Emergency-related components
│   ├── facility/          # Facility display components
│   ├── layout/            # Layout components (header, footer)
│   ├── map/               # Map view components
│   └── ui/                # Base UI components (buttons, dialogs, etc.)
├── hooks/                 # Custom React hooks
│   ├── use-emergency-handler.ts
│   ├── use-geolocation.ts
│   └── use-toast.ts
├── lib/                   # Utility functions and data
│   ├── data.ts            # Health facility data
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Utility functions
└── styles/                # Additional styling files
```

## 🎨 Design System

### Color Palette
- **Primary**: Soft, calming blue (#64B5F6) - Trust and health
- **Background**: Light blue (#E3F2FD) - Calm, trustworthy atmosphere
- **Accent**: Gentle green (#A5D6A7) - Growth and well-being
- **Typography**: Clean, readable sans-serif fonts

### Design Principles
- **Map-centric Design**: Primary focus on geographical navigation
- **Accessibility First**: WCAG compliant components
- **Mobile Responsive**: Optimized for all device sizes
- **Clean Interface**: Minimal, intuitive user experience

## 🔧 Configuration

### Firebase Setup
The application is configured for Firebase App Hosting with the following settings:
- **Max Instances**: 1 (configurable in `apphosting.yaml`)
- **Runtime**: Node.js
- **Framework**: Next.js

### Environment Configuration
Key environment variables needed:
- Google AI API credentials
- Firebase project configuration
- Map service API keys (if using external map services)

## 🚀 Deployment

### Firebase App Hosting
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Vercel Deployment
The application is also compatible with Vercel:
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the IsabiFine AI Team
- Check the documentation in the `/docs` folder

## 🙏 Acknowledgments

- Nigerian healthcare data providers
- Google Genkit AI framework
- Open source community contributors
- Healthcare professionals who provided insights

---

**Built by IsabiDeveloper Team with ❤️ for Nigerian healthcare accessibility**


# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
