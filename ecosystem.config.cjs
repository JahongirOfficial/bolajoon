module.exports = {
    apps: [
        {
            name: 'bolajoon',
            script: 'server.js',
            cwd: '/var/www/bolajoon',
            env_production: {
                NODE_ENV: 'production',
            },
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            error_file: '/var/www/bolajoon/logs/app-error.log',
            out_file: '/var/www/bolajoon/logs/app-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
        },
        {
            name: 'bolajoon-bot',
            script: 'lead-bot/index.js',
            cwd: '/var/www/bolajoon',
            env_production: {
                NODE_ENV: 'production',
            },
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '128M',
            error_file: '/var/www/bolajoon/logs/bot-error.log',
            out_file: '/var/www/bolajoon/logs/bot-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
        },
    ],
};
