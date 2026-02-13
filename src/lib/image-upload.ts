import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function saveImage(base64Image: string, fileName: string): Promise<string> {
  // Decodificar a string base64
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Criar diretório se não existir
  const uploadDir = path.join(process.cwd(), 'public', 'convidados');
  await mkdir(uploadDir, { recursive: true });

  // Salvar imagem
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  // Retornar caminho relativo para armazenar no banco de dados
  return `/convidados/${fileName}`;
}