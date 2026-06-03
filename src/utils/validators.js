export const loginSchema = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      message: "Please enter a valid email",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  },
};

export const registerSchema = {
  name: {
    required: "Name is required",
    maxLength: {
      value: 50,
      message: "Name cannot exceed 50 characters",
    },
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      message: "Please enter a valid email",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  },
  confirmPassword: {
    required: "Please confirm your password",
    validate: (value, formValues) =>
      value === formValues.password || "Passwords do not match",
  },
};

export const forgotPasswordSchema = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      message: "Please enter a valid email",
    },
  },
};
