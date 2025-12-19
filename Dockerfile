# Verwende ein Node.js-Image als Basis
FROM node:18-alpine AS builder

# Setze das Arbeitsverzeichnis
WORKDIR /app

# Kopiere die package.json und die package-lock.json
COPY package.json package-lock.json ./

# Installiere die Abhängigkeiten
RUN npm ci

# Kopiere den gesamten Code
COPY . .

# Baue die Next.js-Anwendung
RUN npx prisma generate
RUN npm run build

# ---- Produktion ----
FROM node:18-alpine AS runner

WORKDIR /app

# Kopiere das erstellte Build-Verzeichnis aus der vorherigen Stufe
COPY --from=builder /app ./

# Setze die Umgebungsvariable für Next.js
ENV NODE_ENV=production

# Exponiere den Port, auf dem Next.js läuft
EXPOSE 3000

# Starte die Anwendung
CMD ["npm", "run", "start"]