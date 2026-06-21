import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://YOUR-APP.vercel.app';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ---------------------------------------------------------------------------
// Token storage helpers
// ---------------------------------------------------------------------------
export const saveSession = async (token, user) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);

export const getStoredUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearSession = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const registerUser = async ({ name, email, password }) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || `Server error: ${response.status}`);
  }
  await saveSession(data.access_token, data.user);
  return data;
};

export const loginUser = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || `Server error: ${response.status}`);
  }
  await saveSession(data.access_token, data.user);
  return data;
};

export const logoutUser = async () => {
  await clearSession();
};

export const generateTutorGuidance = async ({
  assignmentPrompt,
  rubricText,
  gradeLevel,
  deadline,
  reportType,
}) => {
  const token = await getToken();
  if (!token) {
    throw new Error('You must be logged in to generate tutor guidance.');
  }

  const formData = new FormData();
  formData.append('assignment_prompt', assignmentPrompt);
  if (rubricText) formData.append('rubric_text', rubricText);
  if (gradeLevel) formData.append('grade_level', gradeLevel);
  if (deadline) formData.append('deadline', deadline);
  if (reportType) formData.append('report_type', reportType);

  const response = await fetch(`${API_BASE_URL}/tutor/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) {
      await clearSession();
      throw new Error('Your session has expired. Please log in again.');
    }
    throw new Error(err.detail || `Server error: ${response.status}`);
  }

  return response.json();
};