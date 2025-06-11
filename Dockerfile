# ---------- Base Stage ----------
FROM node:20.15.0 AS base

# Set working directory
WORKDIR /usr/src/app

# Copy app files
COPY . .

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build


# ---------- Production Stage ----------
FROM node:20.15.0 AS prod

WORKDIR /usr/src/app

# Timezone (optional)
ENV TZ="Asia/Kolkata"

# Copy build artifacts
COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package*.json ./
COPY --from=base /usr/src/app/prisma ./prisma

# Copy the entrypoint script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Environment variable to avoid interactive prompts
ENV NODE_ENV=production

# Start with entrypoint (run migration + start server)
CMD ["./entrypoint.sh"]
