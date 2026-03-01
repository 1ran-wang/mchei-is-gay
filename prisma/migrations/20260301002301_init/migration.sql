-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "batch" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "steamId" TEXT,
    "usedBy" TEXT,
    "email" TEXT,
    "emailPassword" TEXT,
    "emailProvider" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchCache" (
    "id" SERIAL NOT NULL,
    "matchId" BIGINT NOT NULL,
    "steamId" TEXT NOT NULL,
    "heroId" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "playerSlot" INTEGER NOT NULL,
    "radiantWin" BOOLEAN NOT NULL,
    "duration" INTEGER NOT NULL,
    "startTime" INTEGER NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileCache" (
    "id" SERIAL NOT NULL,
    "steamId" TEXT NOT NULL,
    "personaName" TEXT,
    "avatarUrl" TEXT,
    "rankTier" INTEGER,
    "mmrEstimate" INTEGER,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MmrHistory" (
    "id" SERIAL NOT NULL,
    "steamId" TEXT NOT NULL,
    "mmrEstimate" INTEGER,
    "rankTier" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MmrHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySession" (
    "id" SERIAL NOT NULL,
    "steamId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ActivitySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- CreateIndex
CREATE INDEX "Account_usedBy_idx" ON "Account"("usedBy");

-- CreateIndex
CREATE INDEX "Account_steamId_idx" ON "Account"("steamId");

-- CreateIndex
CREATE INDEX "MatchCache_steamId_idx" ON "MatchCache"("steamId");

-- CreateIndex
CREATE INDEX "MatchCache_fetchedAt_idx" ON "MatchCache"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MatchCache_matchId_steamId_key" ON "MatchCache"("matchId", "steamId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileCache_steamId_key" ON "ProfileCache"("steamId");

-- CreateIndex
CREATE INDEX "ProfileCache_fetchedAt_idx" ON "ProfileCache"("fetchedAt");

-- CreateIndex
CREATE INDEX "MmrHistory_steamId_idx" ON "MmrHistory"("steamId");

-- CreateIndex
CREATE INDEX "MmrHistory_recordedAt_idx" ON "MmrHistory"("recordedAt");

-- CreateIndex
CREATE INDEX "ActivitySession_steamId_idx" ON "ActivitySession"("steamId");

-- CreateIndex
CREATE INDEX "ActivitySession_startedAt_idx" ON "ActivitySession"("startedAt");
