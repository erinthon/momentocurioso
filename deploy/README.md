# Deploy — EC2 (produção)

O site roda numa única instância EC2 (t3.micro, Ubuntu 24.04, `sa-east-1`) em
https://momentocurioso.ia.br — Nginx serve o build do Angular e faz proxy de
`/api` para o Spring Boot (systemd); MySQL local na própria instância.

Por ser uma instância de 1 GB de RAM, **os builds acontecem na máquina de
desenvolvimento**, não no servidor (que só tem JRE 17, MySQL e Nginx).

## Renderização pública

Não há processo Node em produção. O build Angular usa SSG apenas na máquina de
desenvolvimento e gera HTML estático para `/blog/posts`, `/privacidade` e
`/termos`. O arquivo `index.csr.html` continua sendo o fallback das rotas SPA
privadas.

As páginas de artigo são atualizadas em tempo real pelo Spring:

- o Nginx encaminha `/blog/posts/<slug>` para `/api/post-pages/<slug>`;
- o Spring lê `index.csr.html`, injeta HTML sanitizado, canonical, Open Graph,
  Twitter Card e JSON-LD;
- `/api/posts/<slug>/social-thumbnail` converte a thumbnail do banco em JPEG
  1200×630, com corte central 1,91:1 e cache, para Open Graph e Twitter Card;
- `/api/posts/<slug>/thumbnail` preserva a imagem original usada na listagem;
- URLs legadas `/posts/<slug>` recebem redirect HTTP 301 para a rota canônica.

Assim, um post novo ganha HTML rastreável e preview social imediatamente, sem
rebuild diário e sem aumentar o consumo de RAM da EC2.

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

### Newsletter por e-mail

O envio fica desabilitado até que um provedor SMTP seja configurado em
`/etc/momentocurioso.env`. A captura local continua funcional sem SMTP, mas em
produção a confirmação por e-mail e o disparo das edições exigem:

```dotenv
NEWSLETTER_MAIL_ENABLED=true
NEWSLETTER_FROM_EMAIL=contato@momentocurioso.ia.br
NEWSLETTER_FROM_NAME=Momento Curioso
NEWSLETTER_TOKEN_SECRET=<segredo longo e estável>
MAIL_HOST=<host SMTP>
MAIL_PORT=587
MAIL_USERNAME=<usuário SMTP>
MAIL_PASSWORD=<senha SMTP>
```

O domínio remetente deve ter SPF, DKIM e DMARC configurados no provedor de DNS.
O `NEWSLETTER_TOKEN_SECRET` não deve ser rotacionado sem necessidade, pois ele
assina os links de cancelamento já enviados.

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

O build do frontend consulta a API pública de produção para prerenderizar a
listagem. A resposta pública usa URLs de thumbnail, nunca base64, e o HTML
gerado deve permanecer abaixo de 150 KB. Antes do upload, confira:

```bash
wc -c frontend/dist/frontend/browser/blog/posts/index.html
grep -c 'data:image/.*;base64' frontend/dist/frontend/browser/blog/posts/index.html
# esperado: tamanho < 150000 e contagem 0
```

## Verificação pós-deploy

```bash
# redirect legado é HTTP, não apenas Angular
curl -sI https://momentocurioso.ia.br/posts/<slug>

# HTML do artigo contém corpo, canonical e cards
curl -s https://momentocurioso.ia.br/blog/posts/<slug> \
  | grep -E '<title>|rel="canonical"|property="og:|twitter:card|server-post-snapshot'

# thumbnail social é uma imagem HTTP real
curl -sI https://momentocurioso.ia.br/api/posts/<slug>/social-thumbnail \
  | grep -Ei 'content-type|cache-control'

# páginas estáticas têm conteúdo sem executar JavaScript
curl -s https://momentocurioso.ia.br/privacidade | grep -i 'LGPD'
curl -s https://momentocurioso.ia.br/termos | grep -i 'Termos de Uso'
```

## Acesso

- SSH liberado no security group `sg-00ffdd1a424e930ad` apenas para o IP do
  desenvolvedor (atualizar a regra se o IP residencial mudar)
- Logs do backend: `sudo journalctl -u momentocurioso -f`
- Env de produção: `sudo cat /etc/momentocurioso.env`
