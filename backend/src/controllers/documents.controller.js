import { PrismaClient } from '@prisma/client';
import { generateDocument } from '../services/docGenerator.js';
import { createZipFromDocuments } from '../services/zipService.js';

const prisma = new PrismaClient();

export const generateDocuments = async (req, res) => {
  try {
    const { documents, formData } = req.body;
    
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: 'Необходимо выбрать хотя бы один документ' });
    }
    
    if (!formData || !formData.organizationName || !formData.inn) {
      return res.status(400).json({ message: 'Заполните обязательные поля организации' });
    }
    
    // Генерация всех документов
    const generatedDocs = [];
    
    for (const docName of documents) {
      try {
        const docBuffer = await generateDocument(docName, formData);
        generatedDocs.push({
          name: docName,
          buffer: docBuffer
        });
      } catch (docError) {
        console.error(`Ошибка генерации документа "${docName}":`, docError.message);
        // Продолжаем генерацию остальных документов
      }
    }
    
    if (generatedDocs.length === 0) {
      return res.status(500).json({ message: 'Не удалось сгенерировать ни один документ' });
    }
    
    // Создание ZIP архива
    const zipBuffer = await createZipFromDocuments(generatedDocs);
    
    // Сохранение записи в БД
    await prisma.documentRequest.create({
      data: {
        userId: req.user.userId,
        documents: documents,
        formData: formData,
        status: 'completed'
      }
    });
    
    // Отправка файла
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="documents_152fz_${new Date().toISOString().split('T')[0]}.zip"`);
    res.send(zipBuffer);
    
  } catch (error) {
    console.error('Generate documents error:', error);
    res.status(500).json({ message: 'Ошибка генерации документов: ' + error.message });
  }
};
