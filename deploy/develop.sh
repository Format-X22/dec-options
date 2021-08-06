#/usr/bin/env bash

# cleanup on error
function cleanup() {
  echo "cleanup"
}

source ~/.bashrc
source ~/.nvm/nvm.sh

node -v

nvm use 14

echo "Stop old process"
pm2 --silent stop opex_api_staging
pm2 --silent stop opex_agg_staging
echo "Stopped"
set -e
echo "Move old directory"
rm -rf /var/www/opex/stage/old
mv /var/www/opex/stage/current/ /var/www/opex/stage/old

echo "clear old directory"
rm -rf /var/www/opex/stage/current/*

echo "Copy source to directory"
cd /var/www/opex/stage/source/ && yarn
mkdir /var/www/opex/stage/current
cp -r /var/www/opex/stage/source/* /var/www/opex/stage/current
cp /var/www/opex/stage/source/.env /var/www/opex/stage/current

echo "Start new process"
cd /var/www/opex/stage/current && yarn pm2:start:all:staging