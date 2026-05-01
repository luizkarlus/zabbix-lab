FROM zabbix/zabbix-server-mysql:latest

USER root

# Instala PHP
RUN apk add --no-cache php php-cli php-curl curl

# Cria diretório de log
RUN mkdir -p /var/log/zabbix && \
    chown -R zabbix:zabbix /var/log/zabbix && \
    chmod 775 /var/log/zabbix

# Copia script
COPY alertscripts /usr/lib/zabbix/alertscripts

# Permissão + correção CRLF
RUN chmod +x /usr/lib/zabbix/alertscripts/envia_whats.php && \
    sed -i 's/\r$//' /usr/lib/zabbix/alertscripts/envia_whats.php

USER zabbix