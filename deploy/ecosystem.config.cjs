module.exports = {
  apps: [
    {
      name: 'letto',
      cwd: '/var/www/letto',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      max_memory_restart: '700M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
