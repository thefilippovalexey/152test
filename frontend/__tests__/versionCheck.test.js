import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkHealth, CLIENT_EXPECTED_VERSION, CLIENT_EXPECTED_API_VERSION } from '../api';

// Мокаем fetch
global.fetch = vi.fn();

describe('Version Check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен возвращать ok=true при совпадении версий', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        serverVersion: CLIENT_EXPECTED_VERSION,
        apiVersion: CLIENT_EXPECTED_API_VERSION,
        status: 'ok'
      })
    });

    const result = await checkHealth();
    
    expect(result.ok).toBe(true);
    expect(result.versionMismatch).toBe(false);
    expect(result.apiVersionMismatch).toBe(false);
    expect(result.warning).toBeNull();
  });

  it('должен обнаруживать рассинхронизацию версии сервера', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        serverVersion: '0.9.0',
        apiVersion: CLIENT_EXPECTED_API_VERSION,
        status: 'ok'
      })
    });

    const result = await checkHealth();
    
    expect(result.ok).toBe(true);
    expect(result.versionMismatch).toBe(true);
    expect(result.apiVersionMismatch).toBe(false);
    expect(result.warning).toContain('Внимание');
    expect(result.warning).toContain('0.9.0');
    expect(result.warning).toContain(CLIENT_EXPECTED_VERSION);
  });

  it('должен обнаруживать рассинхронизацию версии API', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        serverVersion: CLIENT_EXPECTED_VERSION,
        apiVersion: 'v2',
        status: 'ok'
      })
    });

    const result = await checkHealth();
    
    expect(result.ok).toBe(true);
    expect(result.versionMismatch).toBe(false);
    expect(result.apiVersionMismatch).toBe(true);
    expect(result.warning).toBeTruthy();
  });

  it('должен обрабатывать ошибку соединения', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await checkHealth();
    
    expect(result.ok).toBe(false);
    expect(result.versionMismatch).toBe(true);
    expect(result.apiVersionMismatch).toBe(true);
    expect(result.error).toBe('Network error');
    expect(result.warning).toContain('Не удалось подключиться');
  });

  it('должен обрабатывать HTTP ошибки', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const result = await checkHealth();
    
    expect(result.ok).toBe(false);
    expect(result.error).toBe('HTTP 500');
  });

  it('должен использовать правильные константы версий', () => {
    expect(CLIENT_EXPECTED_VERSION).toBe('1.0.0');
    expect(CLIENT_EXPECTED_API_VERSION).toBe('v1');
    expect(typeof CLIENT_EXPECTED_VERSION).toBe('string');
    expect(typeof CLIENT_EXPECTED_API_VERSION).toBe('string');
  });
});
