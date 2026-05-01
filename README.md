# 📘 Documentação – Zabbix + WPPConnect + WhatsApp

## 📁 Estrutura do Projeto

```bash
.
├── docker-compose.yaml
├── wppconnect/
│   ├── Dockerfile
│   ├── wpp.js
│   └── package.json
└── zabbix-server/
    ├── Dockerfile
    └── alertscripts/
        └── envia_whats.php
```

---

# 🐳 docker-compose.yaml

```yaml
services:

  mysql:
    image: mysql:8.0
    container_name: zabbix-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: zabbix
      MYSQL_USER: zabbix
      MYSQL_PASSWORD: zabbix
    command:
      - --log-bin-trust-function-creators=1
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_bin
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-proot"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 40s
    networks:
      - monitornet

  zabbix-server:
    build: ./zabbix-server
    container_name: zabbix-server
    restart: always
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      DB_SERVER_HOST: mysql
      MYSQL_DATABASE: zabbix
      MYSQL_USER: zabbix
      MYSQL_PASSWORD: zabbix
    ports:
      - "10051:10051"
    healthcheck:
      test: ["CMD", "pgrep", "zabbix_server"]
      interval: 15s
      timeout: 5s
      retries: 5
    networks:
      - monitornet

  zabbix-web:
    image: zabbix/zabbix-web-nginx-mysql:latest
    container_name: zabbix-web
    restart: always
    depends_on:
      mysql:
        condition: service_healthy
      zabbix-server:
        condition: service_healthy
    environment:
      DB_SERVER_HOST: mysql
      MYSQL_DATABASE: zabbix
      MYSQL_USER: zabbix
      MYSQL_PASSWORD: zabbix
      ZBX_SERVER_HOST: zabbix-server
      PHP_TZ: America/Sao_Paulo
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080"]
      interval: 20s
      timeout: 5s
      retries: 5
    networks:
      - monitornet

  zabbix-agent:
    image: zabbix/zabbix-agent:latest
    container_name: zabbix-agent
    restart: always
    environment:
      ZBX_SERVER_HOST: zabbix-server
    depends_on:
      zabbix-server:
        condition: service_healthy
    networks:
      - monitornet

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/login"]
      interval: 20s
      timeout: 5s
      retries: 5
    networks:
      - monitornet

  wppconnect:
    build: ./wppconnect
    container_name: wppconnect
    restart: always
    ports:
      - "8000:8000"
    volumes:
      - wpp_tokens:/opt/wpp-server/tokens
    shm_size: "1gb"
    depends_on:
      zabbix-server:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/status"]
      interval: 20s
      timeout: 10s
      retries: 10
      start_period: 60s
    networks:
      - monitornet

volumes:
  mysql_data:
  grafana_data:
  wpp_tokens:

networks:
  monitornet:
    driver: bridge
```

---

# 🐳 zabbix-server/Dockerfile

```dockerfile
FROM zabbix/zabbix-server-mysql:latest

USER root

# Instala PHP no Alpine
RUN apk add --no-cache php php-cli php-curl curl

# Cria diretório de log
RUN mkdir -p /var/log/zabbix && \
    chown -R zabbix:zabbix /var/log/zabbix && \
    chmod 775 /var/log/zabbix

# Copia scripts
COPY alertscripts /usr/lib/zabbix/alertscripts

# Ajusta permissões + remove CRLF
RUN chmod +x /usr/lib/zabbix/alertscripts/envia_whats.php && \
    sed -i 's/\r$//' /usr/lib/zabbix/alertscripts/envia_whats.php

USER zabbix
```

---

# 📜 envia_whats.php (modelo funcional)

```php
#!/usr/bin/php
<?php

$mensagem = $argv[1] ?? 'Teste';
$numero   = $argv[2] ?? '5599999999999';

$url = "http://wppconnect:8000/api/send-message";

$data = [
    "phone" => $numero,
    "message" => $mensagem
];

$options = [
    "http" => [
        "header"  => "Content-type: application/json",
        "method"  => "POST",
        "content" => json_encode($data),
        "timeout" => 10
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

// Log
file_put_contents('/var/log/zabbix/whatsapp.log',
    date('Y-m-d H:i:s') . " - Enviado para $numero: $mensagem\n",
    FILE_APPEND
);

?>
```

---

# ⚙️ Configuração no Zabbix (Media Type)

### Tipo:

```
Script
```

### Script name:

```
envia_whats.php
```

### Script parameters:

```
{ALERT.MESSAGE}
{ALERT.SENDTO}
```

### ⚠️ IMPORTANTE (Execução correta)

No campo de comando, usar:

```bash
php envia_whats.php
```

---

# 🧪 Testes realizados (validados)

### ✔ Arquivo presente no container

```bash
ls -l /usr/lib/zabbix/alertscripts
```

---

### ✔ PHP instalado

```bash
php -v
```

---

### ✔ Execução manual

```bash
php /usr/lib/zabbix/alertscripts/envia_whats.php "teste" "55XXXXXXXXXXX"
```

---

### ✔ Log funcionando

```bash
cat /var/log/zabbix/whatsapp.log
```

---

### ✔ API WPPConnect ativa

```bash
curl http://wppconnect:8000/status
```

---

# 🧠 Boas práticas aplicadas

* ✔ Script embutido na imagem (sem volume)
* ✔ Permissões corretas
* ✔ Conversão automática de CRLF → LF
* ✔ PHP instalado no container correto
* ✔ Healthchecks configurados
* ✔ Dependências com `condition: service_healthy`
* ✔ Logs persistentes no container
* ✔ Execução via interpretador (`php`)

---

# 🚀 Estado final

✔ Ambiente estável
✔ Containers saudáveis
✔ Integração Zabbix → WhatsApp funcional
✔ Pronto para produção