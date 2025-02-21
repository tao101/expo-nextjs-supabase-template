# Full-Stack Web & Mobile Template

A Next.js, Expo, and Supabase template for building full-stack web and mobile applications. This project provides a comprehensive foundation for building cross-platform applications with a modern tech stack.

## Project Structure

    ├── apps/
    │   ├── mobile-app/     # Expo React Native app with Tamagui UI
    │   ├── web-app/        # Next.js 15 app with shadcn/ui
    │   └── supabase/       # Supabase configuration and migrations
    ├── shared/             # Shared utilities and types
    ├── package.json        # Root workspace config
    └── pnpm-workspace.yaml # Monorepo configuration

## Features

- 🌐 Cross-platform application support (Web, iOS, Android)
- 🔐 Supabase authentication and real-time features
- 💾 Shared state management with Legend State
- 🎨 Modern UI with shadcn/ui (web) and Tamagui (mobile)
- 📦 Monorepo setup with PNPM workspaces
- 🔄 Real-time updates and notifications
- 🗄️ Supabase storage for media handling
- 🚀 Next.js API routes for backend functionality

## Tech Stack

- **Frontend (Web)**: Next.js 15, shadcn/ui, Legend State
- **Frontend (Mobile)**: Expo, Tamagui, Legend State
- **Backend**: Supabase, Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **State Management**: Legend State
- **Package Management**: PNPM

## Prerequisites

- Node.js 20+
- PNPM 10+
- Supabase CLI
- iOS/Android simulators (for mobile development)

## Getting Started

1. **Clone and Install Dependencies**

```bash
git clone repo-url
cd community-platform
pnpm install
```

2. **Environment Setup**

Copy the example environment files and update with your values:

```bash
cp apps/web-app/env.example apps/web-app/.env
cp apps/mobile-app/env.example apps/mobile-app/.env
```

3. **Start Supabase Local Development**

```bash
pnpm supabase:start
```

4. **Run the Application**

Web Application:

```bash
pnpm dev:web
```

Mobile Application:

```bash
pnpm dev:mobile
```

## Development Workflow

### Installing Dependencies

For specific parts of the project:

Web application

```bash
pnpm install --filter web-app <package-name>
```

Mobile application

```bash
pnpm install --filter mobile-app <package-name>
```

Shared utilities

```bash
pnpm install --filter shared <package-name>
```

### Running Tests

```bash
pnpm test
```

### Database Migrations

```bash
pnpm supabase:migrate
```

### Pull Database Migrations

```bash
pnpm supabase:migrate:pull
```

## Deployment

### Web Application

The Next.js application is deployed on Coolify using Docker containerization. The deployment configuration can be found in `.coolify/Dockerfile`.

### Mobile Application

PreBuild the Expo application using Expo prebuild:

```bash
pnpm build:mobile
```

### Supabase

The Supabase project is deployed on Coolify using coolify template for supabase.

### Supabase Types

The Supabase types are generated using the Supabase CLI from your local supabase project.

```bash
pnpm supabase:genTypes
```

The types are generated in the `shared` folder in the supabaseTypes.ts file and are used in the `services/supabase` folder.

## Contributing

1. Create your feature branch (`git checkout -b feature/amazing-feature`)
2. pull your local supabase to create a new migration if you made changes to using supabase ui
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request with staging branch
6. joe will review your PR and merge it into the staging branch
7. joe will deploy the staging branch to the production environment in main branch

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Legend State Documentation](https://legendapp.com/open-source/state/)
- [Tamagui Documentation](https://tamagui.dev/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [PNPM Workspaces](https://pnpm.io/workspaces)
