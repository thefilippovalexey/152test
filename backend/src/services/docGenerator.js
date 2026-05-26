import { createReport } from 'docx-templates';

const FOOTER_TEXT = 'Документ сгенерирован в соответствии с Федеральным законом № 152-ФЗ "О персональных данных". Требуется консультация юриста для адаптации под ваши нужды.';

const getTemplateVariables = (docName) => {
  const baseVars = {
    organizationName: '',
    organizationInn: '',
    organizationAddress: '',
    responsibleName: '',
    responsiblePosition: '',
    date: '',
    footerText: FOOTER_TEXT
  };
  
  return baseVars;
};

export const generateDocument = async (docName, formData) => {
  try {
    const templateVars = {
      ...getTemplateVariables(docName),
      ...formData,
      generatedAt: new Date().toLocaleString('ru-RU')
    };
    
    // Создаем простой DOCX документ программно
    // В production здесь была бы загрузка реальных шаблонов
    const docContent = createDocContent(docName, templateVars);
    
    // Для демонстрации возвращаем буфер с текстовым описанием
    // В реальности используется createReport с реальными .docx шаблонами
    const textContent = `
ДОКУМЕНТ: ${docName}
=====================================
Организация: ${templateVars.organizationName}
ИНН: ${templateVars.organizationInn}
Адрес: ${templateVars.organizationAddress}
Ответственный: ${templateVars.responsiblePosition} ${templateVars.responsibleName}
Дата: ${templateVars.date}
=====================================
${FOOTER_TEXT}
`;
    
    // Создаем простой бинарный буфер (заглушка для демонстрации)
    // В production: const result = await createReport({ template: buffer }, templateVars);
    return Buffer.from(textContent, 'utf-8');
    
  } catch (error) {
    console.error(`Ошибка генерации "${docName}":`, error.message);
    throw new Error(`Не удалось сгенерировать документ: ${docName}`);
  }
};

const createDocContent = (docName, vars) => {
  // Здесь была бы логика работы с реальными шаблонами
  // Для каждого из 29 документов свой шаблон
  return { docName, vars };
};
