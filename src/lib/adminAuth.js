export async function login(password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Sikertelen bejelentkezés.');
  }
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function checkSession() {
  try {
    const res = await fetch('/api/auth/session');
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.authenticated;
  } catch {
    return false;
  }
}
