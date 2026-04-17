-- Certificado por fase (config na fase; conquista por utilizador na primeira resposta certa)
ALTER TABLE "EnigmaPhase" ADD COLUMN "providesCertificate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "EnigmaPhase" ADD COLUMN "certificateTitle" TEXT;
ALTER TABLE "EnigmaPhase" ADD COLUMN "certificateImageUrl" TEXT;

CREATE TABLE "EnigmaPhaseCertificateAward" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "enigmaPhaseId" INTEGER NOT NULL,

    CONSTRAINT "EnigmaPhaseCertificateAward_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EnigmaPhaseCertificateAward_userId_enigmaPhaseId_key" ON "EnigmaPhaseCertificateAward"("userId", "enigmaPhaseId");

CREATE INDEX "EnigmaPhaseCertificateAward_userId_idx" ON "EnigmaPhaseCertificateAward"("userId");

ALTER TABLE "EnigmaPhaseCertificateAward" ADD CONSTRAINT "EnigmaPhaseCertificateAward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EnigmaPhaseCertificateAward" ADD CONSTRAINT "EnigmaPhaseCertificateAward_enigmaPhaseId_fkey" FOREIGN KEY ("enigmaPhaseId") REFERENCES "EnigmaPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
