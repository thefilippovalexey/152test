const CLIENT_EXPECTED_VERSION = '1.0.0';
const CLIENT_EXPECTED_API_VERSION = 'v1';

const API_BASE_URL = '/api';

async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    
    const versionMismatch = data.serverVersion !== CLIENT_EXPECTED_VERSION;
    const apiVersionMismatch = data.apiVersion !== CLIENT_EXPECTED_API_VERSION;
    
    return {
      ok: true,
      data,
      versionMismatch,
      apiVersionMismatch,
      warning: versionMismatch || apiVersionMismatch 
        ? `Внимание: версия сервера (${data.serverVersion}) не совпадает с ожидаемой (${CLIENT_EXPECTED_VERSION}). Возможны проблемы совместимости.` 
        : null
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
      versionMismatch: true,
      apiVersionMismatch: true,
      warning: 'Не удалось подключиться к серверу. Проверьте соединение.'
    };
  }
}

async function register(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Регистрация не удалась');
  }
  
  return response.json();
}

async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Авторизация не удалась');
  }
  
  return response.json();
}

async function generateDocuments(token, documents, formData) {
  const response = await fetch(`${API_BASE_URL}/documents/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ documents, formData })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Генерация документов не удалась');
  }
  
  return response.blob();
}

export {
  CLIENT_EXPECTED_VERSION,
  CLIENT_EXPECTED_API_VERSION,
  checkHealth,
  register,
  login,
  generateDocuments
};
