/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance Optimization
  experimental: {
    // Enable modern bundling optimizations
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Enable partial prerendering for better performance
    ppr: false,
    // Optimize server components
    serverComponentsExternalPackages: [
      '@google-cloud/speech',
      'microsoft-cognitiveservices-speech-sdk',
      '@google/generative-ai'
    ],
    // Enable optimized package imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu'
    ],
  },

  // Bundle Optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Audio processing optimizations
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }

    // Optimize audio processing modules
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/audio/',
          outputPath: 'static/audio/',
          name: '[name].[hash].[ext]',
        },
      },
    })

    // Bundle analyzer for production builds
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      if (process.env.ANALYZE === 'true') {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-analyzer-report.html',
          })
        )
      }
    }

    // Audio worklet support
    config.module.rules.push({
      test: /\.worklet\.(js|ts)$/,
      use: {
        loader: 'worklet-loader',
        options: {
          name: 'static/worklets/[name].[hash].[ext]',
        },
      },
    })

    return config
  },

  // Advanced Caching
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minute
    pagesBufferLength: 5,
  },

  // CDN and Asset Optimization
  assetPrefix: process.env.CDN_URL || '',
  
  images: {
    unoptimized: false,
    domains: [
      'images.unsplash.com',
      'cdn.accentcoach.ai',
      process.env.CDN_DOMAIN,
    ].filter(Boolean),
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression and Optimization
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Security Headers
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'microphone=(self), camera=(), geolocation=(), interest-cohort=()'
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' blob: data: https:",
          "font-src 'self' data:",
          "connect-src 'self' https: wss: blob:",
          "media-src 'self' blob: data:",
          "worker-src 'self' blob:",
          "child-src 'self' blob:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; ')
      }
    ]

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/api/(.*)',
        headers: [
          ...securityHeaders,
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || 'https://accentcoach.ai'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          }
        ],
      },
      {
        source: '/audio/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          }
        ],
      }
    ]
  },

  // CORS Configuration
  async rewrites() {
    const rewrites = [
      {
        source: '/health',
        destination: '/api/health',
      }
    ]

    // Only add audio proxy rewrite if AUDIO_SERVICE_URL is defined
    if (process.env.AUDIO_SERVICE_URL) {
      rewrites.unshift({
        source: '/api/audio-proxy/:path*',
        destination: `${process.env.AUDIO_SERVICE_URL}/api/:path*`,
      })
    }

    return rewrites
  },
      {
        source: '/api/audio-proxy/:path*',
        destination: `${process.env.AUDIO_SERVICE_URL}/api/:path*`,
      },
      {
        source: '/health',
        destination: '/api/health',
      }
    ]
  },

  // Redirects for SEO and performance
  async redirects() {
    return [
      {
        source: '/practice-old',
        destination: '/practice',
        permanent: true,
      },
      {
        source: '/dashboard-old',
        destination: '/dashboard',
        permanent: true,
      }
    ]
  },

  // Environment-specific optimizations
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    BUILD_TIME: new Date().toISOString(),
    BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  },

  // Serverless optimization
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // TypeScript and ESLint configuration
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
    dirs: ['app', 'components', 'lib', 'hooks'],
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Internationalization (if needed)
  i18n: {
    locales: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
    defaultLocale: 'en',
    localeDetection: true,
  },
}

// Environment-specific configurations
if (process.env.NODE_ENV === 'production') {
  // Production optimizations
  nextConfig.compiler = {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
    reactRemoveProperties: true,
  }
  
  // Enable SWC minification
  nextConfig.swcMinify = true
  
  // Optimize for serverless
  nextConfig.experimental.outputFileTracingRoot = process.cwd()
}

if (process.env.NODE_ENV === 'development') {
  // Development optimizations
  nextConfig.experimental.turbo = {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  }
}

export default nextConfig