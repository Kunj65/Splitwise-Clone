const AUTH_CURRENT_USER_KEY = "splitwise_current_user";
const AUTH_TOKEN_KEY = "splitwise_token";

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_CURRENT_USER_KEY));
  } catch (error) {
    console.error("auth/utils getCurrentUser error:", error);
    return null;
  }
};

export const setCurrentUser = (user) => {
  localStorage.setItem(AUTH_CURRENT_USER_KEY, JSON.stringify(user));
};

export const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(AUTH_TOKEN_KEY, token);

export const clearAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_CURRENT_USER_KEY);
};

export const safeUser = (user) => {
  if (!user) return null;
  const { password: _password, ...rest } = user;
  return rest;
};
