import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

// Helper to create serializable error payload
const getErrorPayload = (err) => {
  if (err.response) {
    // Server responded with status code outside 2xx
    return {
      message: err.response.data?.message || 'Server error occurred',
      status: err.response.status,
      // Uncomment if your backend returns field-specific errors:
      // errors: err.response.data?.errors || null,
    };
  }

  if (err.request) {
    // Request made but no response received (network error, CORS, timeout...)
    return {
      message: 'Network error - could not reach the server. Please check your connection.',
      status: null,
    };
  }

  // Something happened in setting up the request
  return {
    message: err.message || 'An unexpected error occurred',
    status: null,
  };
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check');
      return data.user;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue(null); // Special case: not authenticated
      }
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ────────────────────────────────────────────────
      // Register
      // ────────────────────────────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
        state.isAuthenticated = false;
        state.user = null;
      })

      // ────────────────────────────────────────────────
      // Login
      // ────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
        state.isAuthenticated = false;
        state.user = null;
      })

      // ────────────────────────────────────────────────
      // Check Auth
      // ────────────────────────────────────────────────
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        // Special handling for 401 (not logged in - normal case)
        if (action.payload === null) {
          state.error = null;
        } else {
          state.error = action.payload?.message || 'Authentication check failed';
        }
        state.isAuthenticated = false;
        state.user = null;
      })

      // ────────────────────────────────────────────────
      // Logout
      // ────────────────────────────────────────────────
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Logout failed';
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export default authSlice.reducer;