module.exports = {
    apps: [
        {
            name: 'opex_api',
            script: 'npm',
            interpreter: 'none',
            args: 'run start:prod:api',
            max_memory_restart: '1024M',
            env: {
                NODE_ENV: 'production',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'opex_agg',
            script: 'npm',
            interpreter: 'none',
            args: 'run start:prod:agg',
            max_memory_restart: '1024M',
            env: {
                NODE_ENV: 'production',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'opex_api_staging',
            script: 'npm',
            interpreter: 'none',
            args: 'run start:prod:api',
            max_memory_restart: '1024M',
            env: {
                NODE_ENV: 'production',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'opex_agg_staging',
            script: 'npm',
            interpreter: 'none',
            args: 'run start:prod:agg',
            max_memory_restart: '1024M',
            env: {
                NODE_ENV: 'production',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};
