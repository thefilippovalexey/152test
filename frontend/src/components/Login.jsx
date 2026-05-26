import { useState } from 'react';
import { register, login } from '../api';

function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await register(email, password);
        alert('Регистрация успешна! Теперь войдите.');
        setIsRegistering(false);
      } else {
        const data = await login(email, password);
        onLogin(data.token, data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {isRegistering ? 'Регистрация' : 'Вход'}
        </h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : (isRegistering ? 'Зарегистрироваться' : 'Войти')}
          </button>
        </form>
        
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          {isRegistering ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
