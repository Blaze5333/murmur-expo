import { type ConfigContext, type ExpoConfig } from 'expo/config';

// GitHub Pages uses a repository subpath; Vercel and native use the root.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name || 'Murmur',
  slug: config.slug || 'murmur-expo',
  experiments: {
    ...config.experiments,
    baseUrl: process.env.MURMUR_BASE_PATH || '',
  },
});
