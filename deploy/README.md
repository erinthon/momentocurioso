# Deploy — EC2 (produção)

O site roda numa única instância EC2 (t3.micro, Ubuntu 24.04, `sa-east-1`) em
https://momentocurioso.ia.br — Nginx serve o build do Angular e faz proxy de
`/api` para o Spring Boot (systemd); MySQL local na própria instância.

Por ser uma instância de 1 GB de RAM, **os builds acontecem na máquina de
desenvolvimento**, não no servidor (que só tem JRE 17, MySQL e Nginx).

## Arquivos

- `setup-server.sh` — script idempotente que instala/atualiza tudo no servidor
- `momentocurioso.service` — unit systemd do backend (user `momento`, heap 384 MB)
- `momentocurioso-nginx.conf` — site Nginx com SSL (certificado gerenciado pelo
  certbot no servidor; renovação automática)

## Segredos

Nenhum segredo vive neste diretório nem no git. Na primeira execução, o
`setup-server.sh` gera `DB_PASSWORD` e `JWT_SECRET` com `openssl rand` e os
grava em `/etc/momentocurioso.env` (root, modo 600) no servidor; execuções
seguintes preservam esse arquivo. A chave SSH (`momentocurioso-key.pem`) fica
fora do repositório.

## Re-deploy

```bash
# 1. build local
cd backend && mvn -DskipTests clean package
cd frontend && npm run build

# 2. upload (a chave fica em ~/.ssh/momentocurioso-key.pem)
scp -i ~/.ssh/momentocurioso-key.pem backend/target/momentocurioso-backend-*.jar ubuntu@54.94.60.198:deploy/app.jar
scp -i ~/.ssh/momentocurioso-key.pem -r frontend/dist/frontend/browser ubuntu@54.94.60.198:deploy/dist
scp -i ~/.ssh/momentocurioso-key.pem deploy/setup-server.sh deploy/momentocurioso.service deploy/momentocurioso-nginx.conf ubuntu@54.94.60.198:deploy/

# 3. aplicar no servidor
ssh -i ~/.ssh/momentocurioso-key.pem ubuntu@54.94.60.198 "sed -i 's/\r$//' ~/deploy/setup-server.sh ~/deploy/momentocurioso.service ~/deploy/momentocurioso-nginx.conf && sudo bash ~/deploy/setup-server.sh"
```

Obs.: o `scp` do `dist` sobrescreve arquivos, mas não remove órfãos em
`~/deploy/dist` — se o build mudar muito, apague o diretório remoto antes.
O `sed` remove CRLF caso os arquivos tenham sido editados no Windows.

## Acesso

- SSH liberado no security group `sg-00ffdd1a424e930ad` apenas para o IP do
  desenvolvedor (atualizar a regra se o IP residencial mudar)
- Logs do backend: `sudo journalctl -u momentocurioso -f`
- Env de produção: `sudo cat /etc/momentocurioso.env`
