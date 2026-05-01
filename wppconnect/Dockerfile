FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Atualizar e instalar dependências
RUN apt update && apt upgrade -y && \
    apt install -y wget curl gnupg2 ca-certificates fonts-liberation \
    libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 \
    libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 \
    libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
    libgbm-dev

# Instalar Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/trusted.gpg.d/google-chrome.gpg && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt update && apt install -y google-chrome-stable

# Instalar Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

# Criar diretório
WORKDIR /opt/wpp-server

# Copiar arquivos
COPY package.json .
RUN npm install

COPY wpp.js .

# Expor porta
EXPOSE 8000

# Rodar app
CMD ["node", "wpp.js"]