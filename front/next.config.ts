import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.googleapis.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'cilxj-yiaaa-aaaag-alkxq-cai.icp0.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'gateway.pinata.cloud', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'img.freepik.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'w.wallhaven.cc', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.googletagmanager.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.clarity.ms', port: '', pathname: '/**' },
      { protocol: "https", hostname: "chart.googleapis.com", port: "", pathname: "/**" }
    ]
  },
  webpack(config, options) {
    const { isServer } = options
    config.resolve.modules.push(path.resolve('./src'))
    config.module.rules.push(
      {
        test: /\.(ogg|mp3|wav|flac|mpe?g)$/i,
        exclude: config.exclude,
        use: [
          {
            loader: require.resolve('url-loader'),
            options: {
              limit: config.inlineImageLimit,
              fallback: require.resolve('file-loader'),
              publicPath: `${config.assetPrefix}/_next/static/media/`,
              outputPath: `${isServer ? '../' : ''}static/media/`,
              name: '[name]-[hash].[ext]',
              esModule: config.esModule || false
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack']
      }
    )
    return config
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|mp3|gif|mp4)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=9999999999, must-revalidate'
          }
        ]
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval'
                https://www.googletagmanager.com
                https://*.clarity.ms
                https://www.google.com
                https://www.youtube.com
                https://www.gstatic.com
                https://auth.privy.io
                https://*.privy.io;
              connect-src 'self'
                http://localhost:3001
                https://www.google-analytics.com
                https://analytics.google.com
                https://stats.g.doubleclick.net
                https://*.clarity.ms
                https://www.google.com
                https://www.gstatic.com
                https://api.iconify.design
                https://api.simplesvg.com
                https://api.unisvg.com
                https://auth.privy.io
                https://*.privy.io;
              img-src 'self' data: https:;
              style-src 'self' 'unsafe-inline';
              frame-src 'self' https://www.google.com https://www.youtube.com https://auth.privy.io https://*.privy.io;
              frame-ancestors 'self';
            `.replace(/\s+/g, ' ').trim()
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ]
  },
  turbopack: {}
}

export default nextConfig
