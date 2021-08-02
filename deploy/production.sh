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
pm2 --silent stop opex_api
pm2 --silent stop opex_agg
echo "Stopped"
set -e
echo "Move old directory"
rm -rf /var/www/opex/production/old
mv /var/www/opex/production/current/ /var/www/opex/production/old

echo "clear old directory"
rm -rf /var/www/opex/production/current/*

echo "Copy source to directory"
cd /var/www/opex/stage/source/ && yarn
mkdir /var/www/opex/production/current
cp -r /var/www/opex/production/source/* /var/www/opex/production/current
cp /var/www/opex/production/source/.env /var/www/opex/production/current

echo "Start new process"
cd /var/www/opex/production/current && yarn pm2:start:all:production