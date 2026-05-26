import { useState, useEffect } from 'react';
import { checkHealth, CLIENT_EXPECTED_VERSION, CLIENT_EXPECTED_API_VERSION } from './api';
import Login from './components/Login';
import DocSelector from './components/DocSelector';
import GeneratorForm from './components/GeneratorForm';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [versionWarning, setVersionWarning] = useState(null);

  useEffect(() => {
    // Проверка здоровья и версии при загрузке
    const initHealthCheck = async () => {
      const result = await checkHealth();
      setHealthStatus(result);
      
      if (result.warning) {
        setVersionWarning(result.warning);
      }
      
      // Проверяем сохраненный токен
      const savedToken = localStorage.getItem('fz152_token');
      const savedUser = localStorage.getItem('fz152_user');
      
      if (savedToken && savedUser && !result.versionMismatch) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    };
    
    initHealthCheck();
  }, []);

  const handleLogin = (newToken, newUser) => {
    localStorage.setItem('fz152_token', newToken);
    localStorage.setItem('fz152_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('fz152_token');
    localStorage.removeItem('fz152_user');
    setToken(null);
    setUser(null);
    setSelectedDocs([]);
  };

  // Если есть рассинхронизация версий - блокируем работу
  if (healthStatus?.versionMismatch || healthStatus?.apiVersionMismatch) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '4rem auto' }}>
          <div className="alert alert-error">
            <h3 style={{ marginBottom: '1rem' }}>⚠️ Несовместимость версий</h3>
            <p>{versionWarning}</p>
            <p style={{ marginTop: '1rem' }}>
              Ожидаемая версия сервера: <strong>{CLIENT_EXPECTED_VERSION}</strong><br />
              Ожидаемая версия API: <strong>{CLIENT_EXPECTED_API_VERSION}</strong>
            </p>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
              Пожалуйста, обновите серверную часть или обратитесь к администратору.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Если здоровье не проверено - показываем загрузку
  if (!healthStatus) {
    return (
      <div className="container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  // Если не авторизован - показываем форму входа
  if (!user || !token) {
    return <Login onLogin={handleLogin} />;
  }

  // Основной интерфейс
  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Генератор документов 152-ФЗ</h1>
          <p style={{ color: '#666' }}>
            Авторизован как: <strong>{user.email}</strong>
          </p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>

      {healthStatus.warning && (
        <div className="alert alert-warning">
          {healthStatus.warning}
        </div>
      )}

      <DocSelector 
        selectedDocs={selectedDocs} 
        onSelectionChange={setSelectedDocs} 
      />

      <GeneratorForm 
        token={token} 
        selectedDocs={selectedDocs} 
        user={user} 
      />

      <footer style={{ marginTop: '3rem', padding: '1rem', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
        <p>Сервис генерации документов по 152-ФЗ v{CLIENT_EXPECTED_VERSION}</p>
        <p style={{ marginTop: '0.5rem' }}>
          ⚠️ Данный сервис предоставляет шаблоны документов. Рекомендуется проконсультироваться с юристом для соответствия вашим конкретным требованиям.
        </p>
      </footer>
    </div>
  );
}

export default App;
