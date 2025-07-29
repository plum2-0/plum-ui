# Plum UI - Next.js Application

A modern Next.js application with TypeScript, Tailwind CSS, and Vercel deployment integration.

## 🚀 Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ESLint** for code quality
- **Vercel** deployment ready
- **Turbopack** for fast development

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd plum-ui
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to Vercel production
- `npm run deploy:preview` - Deploy to Vercel preview

## 🚀 Deployment

### Automatic Deployment with Vercel

This project is configured for seamless deployment on Vercel:

1. **Connect to Vercel:**
   - Push your code to GitHub/GitLab/Bitbucket
   - Import your repository in the [Vercel Dashboard](https://vercel.com/dashboard)
   - Vercel will automatically detect Next.js and configure the deployment

2. **Manual Deployment:**
   ```bash
   # Deploy to production
   npm run deploy
   
   # Deploy to preview
   npm run deploy:preview
   ```

3. **Environment Variables:**
   - Add environment variables in the Vercel dashboard
   - They will be automatically available in your application

### Deployment Configuration

The project includes a `vercel.json` file with optimized settings:
- Automatic framework detection
- Security headers
- Function timeout configuration
- Regional deployment settings

## 📁 Project Structure

```
plum-ui/
├── src/
│   ├── app/           # App Router pages and layouts
│   ├── components/    # Reusable components
│   └── lib/          # Utility functions
├── public/           # Static assets
├── vercel.json      # Vercel deployment configuration
├── next.config.ts   # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration
└── tsconfig.json    # TypeScript configuration
```

## 🔧 Configuration Files

- **`vercel.json`** - Vercel deployment settings
- **`next.config.ts`** - Next.js configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`tsconfig.json`** - TypeScript configuration
- **`eslint.config.mjs`** - ESLint configuration

## 🌐 Production URL

Once deployed, your application will be available at:
- Production: `https://your-app-name.vercel.app`
- Preview: `https://your-app-name-git-branch.vercel.app`

## 📝 Next Steps

1. Customize the application content in `src/app/page.tsx`
2. Add your own components in `src/components/`
3. Configure environment variables in Vercel dashboard
4. Set up custom domain (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
