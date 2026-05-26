import { createZipFromDocuments } from '../src/services/zipService.js';
import JSZip from 'jszip';

describe('ZipService', () => {
  const mockDocuments = [
    { name: 'Политика обработки ПДн', buffer: Buffer.from('Content 1') },
    { name: 'Приказ о назначении', buffer: Buffer.from('Content 2') },
    { name: 'Согласие на обработку', buffer: Buffer.from('Content 3') }
  ];

  describe('createZipFromDocuments', () => {
    it('должен создавать ZIP архив из документов', async () => {
      const result = await createZipFromDocuments(mockDocuments);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('должен содержать правильную структуру ZIP', async () => {
      const result = await createZipFromDocuments(mockDocuments);
      const zip = await JSZip.loadAsync(result);

      // Проверяем наличие папки
      expect(zip.folder('documents_152fz')).toBeTruthy();

      // Проверяем количество файлов
      const files = Object.keys(zip.files).filter(name => !name.endsWith('/'));
      expect(files.length).toBe(3);
    });

    it('должен корректно обрабатывать специальные символы в именах', async () => {
      const docsWithSpecialChars = [
        { name: 'Документ с "символами" и / слэшем', buffer: Buffer.from('Test') }
      ];

      const result = await createZipFromDocuments(docsWithSpecialChars);
      const zip = await JSZip.loadAsync(result);

      const files = Object.keys(zip.files).filter(name => !name.endsWith('/'));
      expect(files.length).toBe(1);
      // Имя файла должно быть очищено от специальных символов
      expect(files[0]).not.toContain('/');
    });

    it('должен работать с пустым массивом (возвращает пустой ZIP)', async () => {
      const result = await createZipFromDocuments([]);
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });
});
