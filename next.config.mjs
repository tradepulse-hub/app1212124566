/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para compatibilidade com Node.js 16
  experimental: {
    esmExternals: false,
    serverComponentsExternalPackages: [
      '@holdstation/worldchain-sdk',
      'async-mutex',
      'ethers',
    ],
  },
  
  // Configurações para WebPack
  webpack: (config, { isServer }) => {
    // Resolve problemas com módulos Node.js no browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }

    // Configurações para async-mutex e outras dependências
    config.resolve.alias = {
      ...config.resolve.alias,
      'async-mutex': require.resolve('async-mutex'),
    }

    return config
  },

  // Transpila módulos ES6 para compatibilidade
  transpilePackages: [
    '@holdstation/worldchain-sdk',
    'async-mutex',
  ],

  // Configurações de runtime
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
