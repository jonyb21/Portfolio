FROM node:22-alpine

WORKDIR /app
COPY package.json ./
COPY server.js ./
COPY media-dimensions.js ./
COPY public ./public
COPY data ./data

ENV NODE_ENV=production
ENV PORT=8788
EXPOSE 8788

CMD ["node", "server.js"]
