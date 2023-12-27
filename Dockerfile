FROM node:20.10.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app/

COPY ./package.json ./pnpm-lock.yaml /app/

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY ./ /app/
RUN pnpm build

FROM base
COPY --from=prod-deps /app/node_modules/ ./node_modules/
COPY --from=build /app/dist/ ./dist/

CMD ["node", "./dist/main.js"]
