import { generateDocument } from '../src/services/docGenerator.js';

describe('DocGenerator Service', () => {
  const mockFormData = {
    organizationName: 'ООО "Тест"',
    organizationInn: '1234567890',
    organizationAddress: 'г. Москва, ул. Тестовая, д. 1',
    responsibleName: 'Иванов Иван Иванович',
    responsiblePosition: 'Директор',
    date: '2024-01-15'
  };

  describe('generateDocument', () => {
    it('должен генерировать документ с правильными переменными', async () => {
      const docName = 'Политика обработки ПДн';
      const result = await generateDocument(docName, mockFormData);

      expect(Buffer.isBuffer(result)).toBe(true);
      const content = result.toString('utf-8');
      
      expect(content).toContain(docName);
      expect(content).toContain(mockFormData.organizationName);
      expect(content).toContain(mockFormData.organizationInn);
      expect(content).toContain('152-ФЗ');
    });

    it('должен обрабатывать разные названия документов', async () => {
      const documents = [
        'Приказ о назначении ответственного',
        'Положение об ИСПДн',
        'Согласие на обработку ПДн'
      ];

      for (const docName of documents) {
        const result = await generateDocument(docName, mockFormData);
        expect(Buffer.isBuffer(result)).toBe(true);
        const content = result.toString('utf-8');
        expect(content).toContain(docName);
      }
    });

    it('должен содержать футер с упоминанием 152-ФЗ', async () => {
      const result = await generateDocument('Тестовый документ', mockFormData);
      const content = result.toString('utf-8');
      
      expect(content).toContain('152-ФЗ');
      expect(content).toContain('персональных данных');
    });
  });
});
