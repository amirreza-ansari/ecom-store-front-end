import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "./authApi";
import toast from "react-hot-toast";

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(credentials);
      localStorage.setItem("accessToken", data.data.accessToken);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return rejectWithValue(message);
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await authApi.register(userData);
      localStorage.setItem("accessToken", data.data.accessToken);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return rejectWithValue(message);
    }
  },
);

// export const fetchCurrentUser = createAsyncThunk(
//   "auth/fetchCurrentUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       const { data } = await authApi.getMe();
//       return data.data.user;
//     } catch (error) {
//       localStorage.removeItem("accessToken");
//       return rejectWithValue("Session expired");
//     }
//   },
// );

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.getMe();
      return data.data.user;
    } catch (error) {
      // Only remove token if it's truly invalid (401), not network error
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
      }
      return rejectWithValue("Session expired");
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await authApi.logout();
  } catch (error) {
    // Silently fail
  }
  localStorage.removeItem("accessToken");
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        toast.success("Welcome back!");
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        toast.success("Account created! Check your email to verify.");
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      // .addCase(fetchCurrentUser.rejected, (state) => {
      //   state.isLoading = false;
      //   state.user = null;
      //   state.isAuthenticated = false;
      // })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        // Don't logout on network errors — only if token was removed
        const token = localStorage.getItem("accessToken");
        if (!token) {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        toast.success("Logged out");
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
