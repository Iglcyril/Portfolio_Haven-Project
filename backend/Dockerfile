FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma generate && bunx prisma migrate deploy && bun run src/index.ts"]
