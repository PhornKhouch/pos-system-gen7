export const validation = {
  isEmail: (email) => {
    return /\S+@\S+\.\S+/.test(email);
  },
  minLength: (str, min) => {
    return typeof str === 'string' && str.trim().length >= min;
  },
  isRequired: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  },
};
