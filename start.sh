#!/bin/bash

echo "Start"

mkdir -p volumes-mnt/proxy/templates
echo "Prepared a directory for templates"

cat nginx-templates/obtain-certificates.conf.template > volumes-mnt/proxy/templates/default.conf.template
echo "Set http-only config for nginx"

# Obtain certificates
docker-compose up -d
echo "Initial docker-compose up done"

cat nginx-templates/main.conf.template > volumes-mnt/proxy/templates/default.conf.template
echo "Changed nginx config to the one that works with https"

docker-compose kill -s SIGHUP frontend-studies-proxy
echo "Restarted container with nginx"

# Save current crontab to temp file
crontab -l > cron.temp
# Add cron job for renewal
echo "0 0 */1 * * docker-compose run frontend-studies-certbot renew && docker-compose kill -s SIGHUP frontend-studies-proxy > /dev/null" >> cron.temp
# Set new crontab
crontab cron.temp
# Remove temp file
rm cron.temp
echo "Set cron to update certificates every month"