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
      { protocol: "https", hostname: "chart.googleapis.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "**.walletconnect.org", port: "", pathname: "/**" },
      { protocol: "https", hostname: "**.walletconnect.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "tokens.1inch.io", port: "", pathname: "/**" },
      { protocol: "https", hostname: "raw.githubusercontent.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "assets.coingecko.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "api.sim.dune.com", port: "", pathname: "/**" }
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
                https://app.dynamic.xyz
                https://*.dynamic.xyz
                https://app.dynamicauth.com
                https://*.dynamicauth.com
                https://*.walletconnect.org
                https://*.walletconnect.com;
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
                https://app.dynamic.xyz
                https://*.dynamic.xyz
                https://app.dynamicauth.com
                https://*.dynamicauth.com
                https://rpc.walletconnect.org
                https://*.walletconnect.org
                https://*.walletconnect.com
                https://relay.walletconnect.org
                https://relay.walletconnect.com
                https://api.sim.dune.com
                https://cloudflare-eth.com
                https://*.infura.io
                https://*.alchemy.com
                https://*.publicnode.com
                https://eth.llamarpc.com
                https://*.llamarpc.com
                https://rpc.ankr.com
                https://*.ankr.com
                https://eth-mainnet.g.alchemy.com
                https://polygon-rpc.com
                https://*.polygon.technology
                https://bsc-dataseed.binance.org
                https://*.binance.org
                wss://*.walletconnect.org
                wss://*.walletconnect.com
                wss://relay.walletconnect.org
                wss://relay.walletconnect.com;
              img-src 'self' data: blob: https:;
              style-src 'self' 'unsafe-inline';
              frame-src 'self' https://www.google.com https://www.youtube.com https://app.dynamic.xyz https://*.dynamic.xyz https://app.dynamicauth.com https://*.dynamicauth.com https://verify.walletconnect.org https://verify.walletconnect.com;
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
