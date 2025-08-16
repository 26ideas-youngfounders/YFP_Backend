FROM node:20-bookworm-slim

# System deps for Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libpango-1.0-0 \
    libu2f-udev \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    xdg-utils \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 👇 add this BEFORE npm ci so Puppeteer doesn’t download Chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
# If you have package-lock.json (you do), keep ci; otherwise use `npm install --omit=dev`
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV TZ=Asia/Kolkata

EXPOSE 3000
CMD ["node", "index.js"]
