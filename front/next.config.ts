import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**', pathname: '/**' },
      { protocol: 'http', hostname: '**', pathname: '/**' }
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
              default-src *;
              script-src * 'unsafe-inline' 'unsafe-eval';
              connect-src *;
              img-src * data: blob:;
              style-src * 'unsafe-inline';
              frame-src *;
              frame-ancestors *;
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
