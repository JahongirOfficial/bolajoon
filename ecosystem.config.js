// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'bolajoon',
    script: 'server.js',
    cwd: '/var/www/bolajoon',
    env: {
      NODE_ENV: 'production',
      MONGODB_URI: 'mongodb+srv://Bolajon:mr.ozodbek2410@cluster0.dlopces.mongodb.net/bolajon-uz?retryWrites=true&w=majority&appName=Bolajon',
      JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
      JWT_EXPIRES_IN: '7d',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXT_PUBLIC_APP_NAME: 'Bolajoon.uz',
      NEXT_PUBLIC_APP_URL: 'https://bolajoon.uz',
      NEXT_PUBLIC_API_URL: 'https://bolajoon.uz',
      TELEGRAM_BOT_TOKEN: '8123574882:AAH7h-BM2zInWdln4RwPVoYZfaOjqLbSkXI',
      TELEGRAM_CHAT_ID: '-1003764341768',
      CRON_SECRET: 'bolajon-cron-secret-2024',
      PAYME_MERCHANT_ID: '69874b603ae533b283c2aa8f',
      PAYME_SECRET_KEY: 'Bb9@yH@EVrfXZDVCej&pSG?BJyeyCN2nXHk0',
      PAYME_ENDPOINT: 'https://checkout.paycom.uz/api',
      BOT_API_SECRET: 'bj-bot-secret-2026-xK9mP3qRvNw'
    }
  }]
};
