# Dev-oriented image. Source is volume-mounted at runtime (see compose),
# so this image only needs the runtime + dependencies.
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
