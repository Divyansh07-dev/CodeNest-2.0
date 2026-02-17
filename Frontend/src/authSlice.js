import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';     // ← fixed: same level as src/

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    console.log('[REGISTER] Sending data:', userData);
    try {
      const response = await axiosClient.post('/user/register', userData);
      console.log('[REGISTER] Success - received:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('[REGISTER] Failed:', error.message);
      if (error.response) {
        console.error('[REGISTER] Server response:', error.response.data);
        console.error('[REGISTER] Status:', error.response.status);
      }
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration failed - check console and network tab'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    console.log('[LOGIN] Sending credentials:', credentials);
    try {
      const response = await axiosClient.post('/user/login', credentials);
      console.log('[LOGIN] Success - received:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('[LOGIN] Failed:', error.message);
      if (error.response) {
        console.error('[LOGIN] Server response:', error.response.data);
      }
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed'
      );
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    console.log('[CHECK AUTH] Starting session check...');
    try {
      const { data } = await axiosClient.get('/user/check');
      console.log('[CHECK AUTH] Success - user:', data.user);
      return data.user;
    } catch (error) {
      console.log('[CHECK AUTH] Failed:', error.message);
      if (error.response?.status === 401) {
        console.log('[CHECK AUTH] No active session (401)');
        return rejectWithValue(null);
      }
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Session check failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      console.log('[LOGOUT] Success');
      return null;
    } catch (error) {
      console.error('[LOGOUT] Failed:', error.message);
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Login
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Check Auth
      .addCase(checkAuth.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload === null ? null : action.payload;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => { state.loading = true; })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;