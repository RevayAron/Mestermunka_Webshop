const BASE_URL = 'https://localhost:7211/api';

export const customFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  // Alapértelmezett fejlécek
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Ha van token, betesszük
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Maga a hívás
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Ha a szerver hibaüzenettel tér vissza (pl. 401, 404, 500)
  if (!response.ok) {
    // Megpróbáljuk kiolvasni a backend által küldött hibaüzenetet
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Hiba történt a szerverrel való kommunikáció során.');
  }

  // Ha minden jó, visszaadjuk az adatot
  return response.json();
};