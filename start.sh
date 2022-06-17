#!/bin/bash

mkdir -p volumes-mnt/proxy/templates
# Set http-only config for nginx
cat nginx-templates/obtain-certificates.conf.template > volumes-mnt/proxy/templates/default.conf.template
# Obtain certificates
docker-compose up -d

# Change nginx config to the one that works with https
cat nginx-templates/main.conf.template > volumes-mnt/proxy/templates/default.conf.template
# Restart container with nginx
docker-compose kill -s SIGHUP frontend-studies-proxy

# Save current crontab to temp file
crontab -l > cron.temp
# Add cron job for renewal
echo "0 0 */1 * * docker-compose run frontend-studies-certbot renew && docker-compose kill -s SIGHUP frontend-studies-proxy > /dev/null" >> cron.temp
# Set new crontab
crontab cron.temp
# Remove temp file
rm cron.temp