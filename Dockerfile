# ---- Base image with OS packages Puppeteer needs ----
FROM node:20-bookworm-slim

# 1) System deps for Chromium & fonts
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

# 2) App directory
WORKDIR /app

# 3) Install deps first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# 4) Copy source
COPY . .

# 5) Environment & Puppeteer runtime
ENV NODE_ENV=production
ENV PORT=3000
# Use system Chromium (faster than downloading)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV TZ=Asia/Kolkata

# 6) Expose & start
EXPOSE 3000
CMD ["node", "index.js"]
