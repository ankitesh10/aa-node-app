FROM node:26 AS builder

WORKDIR /app

RUN npm install -g pnpm 
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build
RUN pnpm prune --prod

FROM node:26-alpine3.23

ENV NODE_ENV=production
USER node
WORKDIR /home/node/code

COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

CMD ["node", "dist/index.js"]
