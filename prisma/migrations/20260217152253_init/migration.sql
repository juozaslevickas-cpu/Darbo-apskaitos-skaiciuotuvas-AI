-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vardas" TEXT NOT NULL,
    "pavarde" TEXT NOT NULL,
    "pareigos" TEXT NOT NULL,
    "etatas" REAL NOT NULL DEFAULT 1.0,
    "savaitineNorma" INTEGER NOT NULL DEFAULT 40,
    "darboSutartiesPradzia" TEXT NOT NULL,
    "sumineApskaita" BOOLEAN NOT NULL DEFAULT true,
    "apskaitinisLaikotarpisMenesiai" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "darbuotojoId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "tipas" TEXT NOT NULL,
    "pamainosPradzia" TEXT,
    "pamainosPabaiga" TEXT,
    "pietuPertraukaMin" INTEGER NOT NULL DEFAULT 60,
    "neatvykimoKodas" TEXT,
    "pastaba" TEXT,
    CONSTRAINT "ScheduleEntry_darbuotojoId_fkey" FOREIGN KEY ("darbuotojoId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "imonesVardas" TEXT NOT NULL DEFAULT '',
    "defaultPietuPertrauka" INTEGER NOT NULL DEFAULT 60,
    "apskaitinisLaikotarpisMenesiai" INTEGER NOT NULL DEFAULT 1
);

-- CreateIndex
CREATE INDEX "ScheduleEntry_darbuotojoId_data_idx" ON "ScheduleEntry"("darbuotojoId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleEntry_darbuotojoId_data_key" ON "ScheduleEntry"("darbuotojoId", "data");
