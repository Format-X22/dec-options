module.exports = {
    apps: [
        {
            name: 'opex_api',
            script: 'yarn',
            interpreter: 'none',
            args: 'run start:prod:api',
            max_memory_restart: '512M',
            env: {
                NODE_ENV: 'production',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'opex_agg',
            script: 'yarn',
            interpreter: 'none',
            args: 'run start:prod:agg',
            max_memory_restart: '512M',
            env: {
                NODE_ENV: 'production',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'opex_api_staging',
            script: 'yarn',
            interpreter: 'none',
            args: 'run start:prod:api',
            max_memory_restart: '512M',
            env: {
                NODE_ENV: 'production',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'opex_agg_staging',
            script: 'yarn',
            interpreter: 'none',
            args: 'run start:prod:agg',
            max_memory_restart: '512M',
            env: {
                NODE_ENV: 'production',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};
