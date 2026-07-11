#!/bin/bash
# Setup do Momento Curioso no servidor. Roda com: sudo bash setup-server.sh
# Espera em /home/ubuntu/deploy: app.jar, dist/ (Angular browser build),
# momentocurioso.service, momentocurioso-nginx.conf
set -eu

DEPLOY_DIR=/home/ubuntu/deploy
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# usuario de sistema para rodar o app
id momento &>/dev/null || useradd --system --no-create-home --shell /usr/sbin/nologin momento

# secrets: gera uma vez, preserva em re-deploys
if [ ! -f /etc/momentocurioso.env ]; then
  DBPW=$(openssl rand -hex 16)
  JWT=$(openssl rand -hex 48)
  cat > /etc/momentocurioso.env <<EOF
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://localhost:3306/momentocurioso?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=mcuser
DB_PASSWORD=$DBPW
JWT_SECRET=$JWT
CORS_ALLOWED_ORIGINS=http://$PUBLIC_IP
SITE_URL=http://$PUBLIC_IP
CLAUDE_API_KEY=
SPRING_JPA_HIBERNATE_DDL_AUTO=update
EOF
  chmod 600 /etc/momentocurioso.env

  mysql <<SQL
CREATE DATABASE IF NOT EXISTS momentocurioso CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mcuser'@'localhost' IDENTIFIED BY '$DBPW';
GRANT ALL PRIVILEGES ON momentocurioso.* TO 'mcuser'@'localhost';
FLUSH PRIVILEGES;
SQL
fi

# backend
mkdir -p /opt/momentocurioso
cp "$DEPLOY_DIR/app.jar" /opt/momentocurioso/app.jar
chown -R momento:momento /opt/momentocurioso
cp "$DEPLOY_DIR/momentocurioso.service" /etc/systemd/system/momentocurioso.service
systemctl daemon-reload
systemctl enable momentocurioso
systemctl restart momentocurioso

# frontend
mkdir -p /var/www/momentocurioso
rm -rf /var/www/momentocurioso/*
cp -r "$DEPLOY_DIR/dist/." /var/www/momentocurioso/
chown -R www-data:www-data /var/www/momentocurioso

# nginx
cp "$DEPLOY_DIR/momentocurioso-nginx.conf" /etc/nginx/sites-available/momentocurioso
ln -sf /etc/nginx/sites-available/momentocurioso /etc/nginx/sites-enabled/momentocurioso
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "=== setup concluido ==="
systemctl --no-pager --lines=0 status momentocurioso || true
