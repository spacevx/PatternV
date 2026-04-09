# Stage 1: Build PatternV C++ binary
FROM gcc:13-bookworm AS cpp-build
RUN apt-get update && apt-get install -y cmake && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY PatternV.cpp CMakeLists.txt ./
RUN cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build --config Release

# Stage 2: Build Next.js app
FROM node:20-slim AS web-build
WORKDIR /app
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ .
ENV PATTERNV_EXE_PATH=/usr/local/bin/PatternV
ENV BUILDS_DIR=/data/builds
RUN npm run build

# Stage 3: Production runtime
FROM node:20-slim
RUN apt-get update && apt-get install -y libstdc++6 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY --from=cpp-build /src/build/PatternV /usr/local/bin/PatternV
COPY --from=web-build /app/.next ./.next
COPY --from=web-build /app/node_modules ./node_modules
COPY --from=web-build /app/package.json ./
# public/ may be empty; copy only if it exists
RUN mkdir -p ./public
COPY --from=web-build /app/next.config.ts ./

ENV NODE_ENV=production
ENV PATTERNV_EXE_PATH=/usr/local/bin/PatternV
ENV BUILDS_DIR=/data/builds
ENV MAX_CONCURRENT_SCANS=3

EXPOSE 3000
CMD ["npm", "start"]
