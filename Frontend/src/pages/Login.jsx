import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      
      {/* Card */}
      <div className="card w-96 bg-gray-800 shadow-2xl border border-gray-700">
        <div className="card-body text-white">

          <h2 className="card-title justify-center text-3xl mb-6 font-bold">
            codeNEST
          </h2>

          {error && (
            <p className="text-red-400 text-center mb-3 text-sm">{error}</p>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Email</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`input input-bordered w-full bg-gray-700 text-white border-gray-600 ${
                  errors.emailId ? "input-error border-red-500" : ""
                }`}
                {...register("emailId")}
              />
              {errors.emailId && (
                <span className="text-red-400 text-sm mt-1">
                  {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text text-white">Password</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pr-10 bg-gray-700 text-white border-gray-600 ${
                    errors.password ? "input-error border-red-500" : ""
                  }`}
                  {...register("password")}
                />

                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-300 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>

              {errors.password && (
                <span className="text-red-400 text-sm mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Login Button */}
            <div className="form-control mt-8">
              <button
                type="submit"
                className="btn bg-blue-600 hover:bg-blue-700 text-white w-full border-none"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>

          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <span className="text-sm text-gray-300">
              Don’t have an account?{" "}
              <NavLink to="/signup" className="text-blue-400 font-semibold">
                Sign Up
              </NavLink>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
