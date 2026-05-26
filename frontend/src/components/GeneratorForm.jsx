import { useState } from 'react';
import { generateDocuments } from '../api';

function GeneratorForm({ token, selectedDocs, user }) {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationInn: '',
    organizationAddress: '',
    responsibleName: '',
    responsiblePosition: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const blob = await generateDocuments(token, selectedDocs, formData);
      
      // Создаем и скачиваем ZIP файл
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `documents_152fz_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (selectedDocs.length === 0) {
    return (
      <div className="card">
        <div className="alert alert-info">
          Выберите хотя бы один документ для генерации.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>Заполните данные организации</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-info">
          Документы успешно сгенерированы и загружены!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="organizationName">Наименование организации *</label>
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            className="form-control"
            value={formData.organizationName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="organizationInn">ИНН *</label>
          <input
            type="text"
            id="organizationInn"
            name="organizationInn"
            className="form-control"
            value={formData.organizationInn}
            onChange={handleChange}
            required
            pattern="[0-9]{10,12}"
            title="ИНН должен содержать 10 или 12 цифр"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="organizationAddress">Юридический адрес *</label>
          <textarea
            id="organizationAddress"
            name="organizationAddress"
            className="form-control"
            rows="3"
            value={formData.organizationAddress}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="responsibleName">ФИО ответственного за ПДн *</label>
          <input
            type="text"
            id="responsibleName"
            name="responsibleName"
            className="form-control"
            value={formData.responsibleName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="responsiblePosition">Должность ответственного *</label>
          <input
            type="text"
            id="responsiblePosition"
            name="responsiblePosition"
            className="form-control"
            value={formData.responsiblePosition}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Дата документа *</label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div style={{ marginTop: '1.5rem' }}>
          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{ marginRight: '1rem' }}
          >
            {loading ? 'Генерация...' : `Сгенерировать ${selectedDocs.length} doc${selectedDocs.length === 1 ? 'умент' : 'ов'}`}
          </button>
          
          {loading && (
            <span style={{ color: '#666' }}>
              Это может занять несколько секунд...
            </span>
          )}
        </div>
      </form>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Будут сгенерированы:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          {selectedDocs.map(doc => (
            <li key={doc}>{doc}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default GeneratorForm;
