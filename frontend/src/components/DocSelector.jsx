const DOCUMENT_CATEGORIES = {
  'Приказы': [
    'О назначении ответственного за обработку ПДн',
    'О назначении ответственного за безопасность ПДн',
    'Об утверждении Политики',
    'Об утверждении Положения об ИСПДн',
    'Об утверждении перечня лиц, допущенных к ПДн',
    'Об утверждении перечня мест хранения ПДн',
    'О создании комиссии по уничтожению ПДн'
  ],
  'Положения и инструкции': [
    'Политика обработки ПДн',
    'Положение об ИСПДн',
    'Инструкция администратора безопасности',
    'Инструкция пользователя ИСПДн',
    'Инструкция по антивирусной защите',
    'Инструкция по резервному копированию'
  ],
  'Перечни': [
    'Перечень обрабатываемых ПДн',
    'Перечень информационных систем',
    'Перечень лиц, допущенных к ПДн',
    'Перечень мест хранения носителей',
    'Перечень используемых СЗИ'
  ],
  'Журналы': [
    'Журнал учета обращений субъектов ПДн',
    'Журнал учета носителей ПДн',
    'Журнал регистрации инцидентов',
    'Журнал инструктажей'
  ],
  'Формы согласий': [
    'Согласие на обработку ПДн работников',
    'Согласие на обработку ПДн клиентов',
    'Согласие на передачу ПДн (если есть)'
  ],
  'Акты': [
    'Акт классификации ИСПДн',
    'Акт определения уровня защищенности',
    'Акт об уничтожении ПДн',
    'Акт инвентаризации носителей'
  ]
};

function DocSelector({ selectedDocs, onSelectionChange }) {
  const handleToggle = (docName) => {
    if (selectedDocs.includes(docName)) {
      onSelectionChange(selectedDocs.filter(d => d !== docName));
    } else {
      onSelectionChange([...selectedDocs, docName]);
    }
  };

  const handleSelectAll = (category, checked) => {
    const docsInCategory = DOCUMENT_CATEGORIES[category];
    if (checked) {
      const newDocs = [...new Set([...selectedDocs, ...docsInCategory])];
      onSelectionChange(newDocs);
    } else {
      onSelectionChange(selectedDocs.filter(d => !docsInCategory.includes(d)));
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>Выберите документы для генерации</h2>
      
      {Object.entries(DOCUMENT_CATEGORIES).map(([category, docs]) => (
        <div key={category}>
          <div className="category-title">
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ marginRight: '0.75rem' }}
                checked={docs.every(d => selectedDocs.includes(d))}
                onChange={(e) => handleSelectAll(category, e.target.checked)}
              />
              {category} ({docs.length})
            </label>
          </div>
          
          <div className="checkbox-group">
            {docs.map((docName) => (
              <label key={docName} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedDocs.includes(docName)}
                  onChange={() => handleToggle(docName)}
                />
                {docName}
              </label>
            ))}
          </div>
        </div>
      ))}
      
      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
        <p>
          <strong>Выбрано:</strong> {selectedDocs.length} из {Object.values(DOCUMENT_CATEGORIES).flat().length} документов
        </p>
      </div>
    </div>
  );
}

export { DOCUMENT_CATEGORIES };
export default DocSelector;
