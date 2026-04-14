export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const getFieldError = (field, value) => {
  switch (field) {
    case 'email':
      if (!value) return 'Email is required';
      if (!validateEmail(value)) return 'Invalid email address';
      return null;
    case 'password':
      if (!value) return 'Password is required';
      if (!validatePassword(value)) return 'Password must be at least 6 characters';
      return null;
    case 'name':
      if (!value) return 'Name is required';
      if (!validateName(value)) return 'Name must be at least 2 characters';
      return null;
    default:
      return null;
  }
};
