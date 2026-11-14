-- CreateTable
CREATE TABLE "ProblemNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" VARCHAR(160) NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProblemNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProblemNote_userId_problemId_key" ON "ProblemNote"("userId", "problemId");

-- AddForeignKey
ALTER TABLE "ProblemNote" ADD CONSTRAINT "ProblemNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
