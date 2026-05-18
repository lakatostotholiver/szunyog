FROM node:26-slim AS base

WORKDIR /app

# ========================================
# Build frontend
# ========================================
FROM base AS build-frontend

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund && \
    npm cache clean --force

# Copy only necessary files for building (respects .dockerignore)
COPY . .

# Build the application
RUN npm run build

# ========================================
# Build backend API
# ========================================
FROM base AS build-backend

RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm install express cors && \
    npm cache clean --force

# ========================================
# Production Stage
# ========================================
FROM base AS production

COPY --from=build-backend --chown=node:node /app/node_modules ./node_modules
COPY --from=build-frontend --chown=node:node /app/dist ./dist
COPY --chown=node:node server.js ./
COPY --chown=node:node ./api ./api

# Switch to non-root user for security
USER node

# Take API key for the AI chat as an environment variable
ENV GROQ_API_KEY ''

# Expose port
EXPOSE 3000

# Start production server
CMD node server.js
