-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "instrutorId" TEXT NOT NULL,
    CONSTRAINT "cursos_instrutorId_fkey" FOREIGN KEY ("instrutorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inscricoes" (
    "alunoId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "dataInscricao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("alunoId", "cursoId"),
    CONSTRAINT "inscricoes_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inscricoes_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "cursos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
