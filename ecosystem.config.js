// const dotenv = require("dotenv");
// dotenv.config();
// Target server hostname or IP address
const TARGET_SERVER_HOST = process.env.TARGET_SERVER_HOST
  ? process.env.TARGET_SERVER_HOST.trim()
  : "";
// Target server username
const TARGET_SERVER_USER = process.env.TARGET_SERVER_USER
  ? process.env.TARGET_SERVER_USER.trim()
  : "";
// Your repository
const REPO = "git@gitlab.pwlnh.com:dexcommas/options_aggregator.git";

const { CI_COMMIT_REF_SLUG } = process.env;

// Target server application path
const TARGET_SERVER_APP_PATH = `/var/www/opex/${CI_COMMIT_REF_SLUG}`;

function prodOrStaging(prodCommand, stagingCommand) {
  return CI_COMMIT_REF_SLUG === "master" ? prodCommand : stagingCommand;
}

module.exports = {
  apps: [
    {
      name: "opex_api",
      script: "yarn",
      interpreter: "none",
      args: "run start:prod:api",
      env: {
        NODE_ENV: "production",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "opex_agg",
      script: "yarn",
      interpreter: "none",
      args: "run start:prod:api",
      env: {
          NODE_ENV: "production",
      },
      env_production: {
          NODE_ENV: "production",
      },
    },
    {
      name: "opex_api_staging",
      script: "yarn",
      interpreter: "none",
      args: "run start:staging:api",
      env: {
          NODE_ENV: "production",
      },
      env_production: {
          NODE_ENV: "production",
      },
    },
    {
      name: "opex_agg_staging",
      script: "yarn",
      interpreter: "none",
      args: "run start:staging:api",
      env: {
          NODE_ENV: "production",
      },
      env_production: {
          NODE_ENV: "production",
      },
    },
  ],
  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    production: {
      user: TARGET_SERVER_USER,
      host: TARGET_SERVER_HOST,
      ref: `origin/${CI_COMMIT_REF_SLUG}`,
      repo: REPO,
      ssh_options: "StrictHostKeyChecking=no",
      path: TARGET_SERVER_APP_PATH,
      "post-deploy": `source ~/.bashrc
        && source ~/.nvm/nvm.sh
        && nvm use 14.16.1
        && yarn
        && echo branch ${CI_COMMIT_REF_SLUG}
        && mv .env.example${prodOrStaging("", ".staging")} .env
        && export PUBLIC_URL=${prodOrStaging(
          "https://decommas.io/gears/app",
          "https://stage.decommas.io/gears/app"
        )}
        && yarn build:all
        && yarn pm2:start:all:${prodOrStaging("production", "staging")}
      `
        .split("\n")
        .join(" "),
    },
  },
};
