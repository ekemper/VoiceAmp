# VoiceAmp

VoiceAmp is an AI-powered grant writing assistant designed to empower mission-driven organizations to craft compelling grant applications that reflect their authentic voice.

## Features

- Interactive demo that simulates AI-enhanced grant application responses
- Sleek, modern UI with a custom color scheme
- Responsive design for all device sizes
- Smooth scrolling navigation

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v8 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ekemper/voiceamp-site.git
cd voiceamp-site
```

2. Install dependencies:
```bash
npm install
```

### Development Mode

To run the application in development mode with hot reloading:

```bash
npm run dev
```

This will start the application on http://localhost:5000

### Production Mode

To run the application in production mode, you need to build it first and then start the server:

```bash
# Build and start in one command
./start-prod.sh

# OR run these commands separately
npm run build
npm run start
```

### macOS Users

If you encounter a `ENOTSUP: operation not supported on socket 0.0.0.0:5000` error on macOS, use our macOS-specific script:

```bash
# Build and start the app with localhost binding for macOS
./start-local.sh
```

This alternative script uses 127.0.0.1 (localhost) instead of 0.0.0.0 for the host binding, which is compatible with newer macOS versions.

The build process:
1. Compiles the React front-end using Vite
2. Bundles the server-side code using esbuild
3. Places all compiled files in the `/dist` directory

## Project Structure

- `/client`: Front-end React application
  - `/src/components`: UI components
  - `/src/hooks`: Custom React hooks
  - `/src/lib`: Utility functions and constants
  - `/src/pages`: Application pages
- `/server`: Express backend
- `/shared`: Shared types and schemas between front and back end

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## Deployment

### Deploying with Replit

1. Ensure your project is on Replit and has all the necessary files
2. Click the "Deploy" button from the Replit interface
3. Follow the prompts to complete the deployment

Replit will handle:
- Building the project
- Hosting the application
- Providing a domain for access (yourusername.replit.app)

## License

MIT