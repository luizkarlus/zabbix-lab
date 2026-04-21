```markdown
# WPP-Server com Zabbix e Grafana

Repositório com ambiente Dockerizado completo contendo **Zabbix** para monitoramento, **Grafana** para visualização de métricas e servidor **WhatsApp** via WPPConnect para integrações e notificações.[file:1][file:2][file:3]

## ✨ Funcionalidades

- **Zabbix Completo**: Stack MySQL + Zabbix Server + Interface Web (porta **8080**)
- **Grafana**: Dashboards de métricas (porta **3000**)
- **WPPConnect API**: Integração WhatsApp (porta **8000**) com endpoints:
  - `GET /status` - Status da conexão
  - `GET /groups` - Lista de grupos
  - `GET /send?number=5511999999999&message=texto` - Envio de mensagens[file:3]
- Rede Docker interna `monitornet`
- Persistência de dados (MySQL, Grafana, tokens WhatsApp)

## 📦 Pré-requisitos

```bash
Docker 20+
Docker Compose 2+
```

## 🚀 Iniciando

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/wpp-server.git
cd wpp-server

# Inicie todos os serviços
docker compose up -d --build
```

## 🌐 Acessando os Serviços

| Serviço     | URL                          | Credenciais Padrão      |
|-------------|------------------------------|-------------------------|
| **Zabbix**  | http://localhost:8080        | Admin / zabbix         |
| **Grafana** | http://localhost:3000        | admin / admin          |
| **WhatsApp**| http://localhost:8000        | API REST               |[file:2]

## 📱 Configurando WhatsApp

1. Acesse `http://localhost:8000/status`
2. Verifique os logs: `docker logs wppconnect`
3. **Escaneie o QR Code** exibido no terminal
4. Tokens salvos automaticamente para reconexão

## 🔧 Endpoints da API WhatsApp

```bash
# Status conexão
curl http://localhost:8000/status

# Listar grupos
curl http://localhost:8000/groups

# Enviar mensagem
curl "http://localhost:8000/send?number=5511999999999&message=Olá!"
```

## ⚙️ Estrutura Docker Compose

```
mysql_data/     → Banco Zabbix persistente
grafana_data/   → Dashboards Grafana
wpp_tokens/     → Sessão WhatsApp persistente
monitornet      → Rede interna Docker
```

## 🛠️ Comandos Úteis

```bash
# Logs em tempo real
docker compose logs -f

# Reiniciar apenas WhatsApp
docker compose restart wppconnect

# Parar tudo
docker compose down

# Limpar volumes (cuidado!)
docker compose down -v
```

## 🔒 Configurações de Produção

```
# docker-compose.yaml - variáveis sensíveis
MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
MYSQL_PASSWORD: ${MYSQL_PASSWORD}
```

Crie `.env`:
```
MYSQL_ROOT_PASSWORD=sua_senha_root
MYSQL_PASSWORD=sua_senha_zabbix
```

## 📚 Stack Tecnológica

```
Node.js + Express (WPP Server)
@wppconnect-team/wppconnect@1.30.0
Zabbix 7.x + MySQL 8.0
Grafana latest
Docker + Docker Compose
```

## 🚨 Para Produção

- ✅ Use variáveis de ambiente (`.env`)
- ✅ Configure HTTPS reverse proxy
- ✅ Altere senhas padrão
- ✅ Configure backups dos volumes
- ✅ Monitore uso de recursos Docker

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.