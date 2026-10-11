# Production Dockerfile for StudyOS
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY index.html ./
COPY style.css ./
COPY app.js ./
COPY server.js ./

# Set correct permissions and switch to non-root user
USER node

# Expose application port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "server.js"]
