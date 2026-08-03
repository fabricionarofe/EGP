import { Request, Response } from 'express';
import { prisma } from '../../prisma/prisma';

export const atualizarFotoPerfil = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fotoPerfil } = req.body;

    // Apenas o próprio usuário pode alterar sua foto
    // @ts-ignore
    const userIdLogado = req.user?.id;
    if (id !== userIdLogado) {
      return res.status(403).json({ error: 'Você não tem permissão para alterar a foto de outro usuário.' });
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: { fotoPerfil },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        fotoPerfil: true,
        matricula: true,
        cpf: true,
        lotacao: true,
        especialidade: true,
        areaFormacao: true
      }
    });

    return res.status(200).json({ message: 'Foto de perfil atualizada com sucesso!', usuario: usuarioAtualizado });
  } catch (error) {
    console.error('Erro ao atualizar foto de perfil:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar foto.' });
  }
};
