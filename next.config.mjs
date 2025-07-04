import path from "path"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para compatibilidade
  experimental: {
    esmExternals: false,
  },

  // External packages required by Server Components / Actions
  serverExternalPackages: [
    '@holdstation/worldchain-sdk',
    'async-mutex',
    'ethers',
    'bignumber.js',
  ],
  
  // Configurações críticas do WebPack
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

    // 🔥 PATCH CRÍTICO: Redireciona bignumber.js para nossa versão patchada
    config.resolve.alias = {
      ...config.resolve.alias,
      // Redirect bignumber.js to the patched version
    }

    // Transpila módulos ES6 para compatibilidade
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    })

    return config
  },

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
