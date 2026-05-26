import JSZip from 'jszip';

export const createZipFromDocuments = async (documents) => {
  try {
    const zip = new JSZip();
    
    // Создаем папку для документов
    const docsFolder = zip.folder('documents_152fz');
    
    // Добавляем каждый документ в ZIP
    for (const doc of documents) {
      const safeName = doc.name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ\s-]/g, '_').trim();
      const fileName = `${safeName}.txt`;
      docsFolder.file(fileName, doc.buffer);
    }
    
    // Генерируем ZIP файл
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    return zipBuffer;
    
  } catch (error) {
    console.error('Ошибка создания ZIP:', error.message);
    throw new Error('Не удалось создать ZIP-архив');
  }
};
