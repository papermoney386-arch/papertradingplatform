import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, Phone, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function Auth({ onLoginSuccess }) {
  const [view, setView] = useState("login"); // login, signup, reset-otp
  
  // Local registered users database
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("registered_users");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        name: "ARJUN",
        email: "arjun@investtrade.com",
        password: "password123",
      }
    ];
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState("arjun@investtrade.com");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Sign up form state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [signUpError, setSignUpError] = useState("");
  
  // Email OTP Reset wizard state
  const [resetEmail, setResetEmail] = useState("");
  const [otpStep, setOtpStep] = useState(1); // 1: Email, 2: OTP, 3: Password, 4: Success
  const [enteredOtp, setEnteredOtp] = useState("");
  const [newOtpPassword, setNewOtpPassword] = useState("");
  const [confirmNewOtpPassword, setConfirmNewOtpPassword] = useState("");
  const [otpError, setOtpError] = useState("");

  const updatePassword = (emailAddress, newPass) => {
    const updated = users.map(u => 
      u.email.toLowerCase() === emailAddress.toLowerCase().trim() 
        ? { ...u, password: newPass } 
        : u
    );
    setUsers(updated);
    localStorage.setItem("registered_users", JSON.stringify(updated));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");

    if (loginEmail && loginPassword) {
      const emailNormalized = loginEmail.toLowerCase().trim();
      const foundUser = users.find(u => u.email.toLowerCase() === emailNormalized);
      
      if (!foundUser) {
        setLoginError("This email address is not registered. Please double check or Sign Up.");
        return;
      }
      
      if (foundUser.password !== loginPassword) {
        setLoginError("Incorrect password. Please try again.");
        return;
      }

      onLoginSuccess({
        name: foundUser.name,
        email: foundUser.email,
      });
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setSignUpError("");

    if (signUpPassword.length < 8) {
      setSignUpError("Password must be at least 8 characters long.");
      return;
    }

    if (signUpPassword !== signUpConfirm) {
      setSignUpError("Passwords do not match.");
      return;
    }

    const emailNormalized = signUpEmail.toLowerCase().trim();
    const existing = users.find(u => u.email.toLowerCase() === emailNormalized);
    if (existing) {
      setSignUpError("An account with this email address already exists.");
      return;
    }

    const newUser = {
      name: signUpName.toUpperCase() || "ARJUN",
      email: emailNormalized,
      password: signUpPassword,
    };

    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem("registered_users", JSON.stringify(updated));

    onLoginSuccess({
      name: newUser.name,
      email: newUser.email,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* 1. LOGIN VIEW */}
      {view === "login" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white py-10 px-8 shadow-sm rounded-2xl border border-slate-100">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-1.5 text-indigo-600 font-bold text-2xl tracking-tight mb-2">
                <span>Ready to trade</span>
              </div>
              <p className="text-slate-500 font-medium text-sm">Login to your account to continue</p>
            </div>

            {loginError && (
              <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold px-4 py-3 rounded-xl">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setView("reset-otp");
                    setOtpStep(1);
                    setResetEmail(loginEmail || "");
                    setEnteredOtp("");
                    setNewOtpPassword("");
                    setConfirmNewOtpPassword("");
                    setOtpError("");
                  }}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                Login
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-slate-500 font-medium">Don’t have an account? </span>
              <button
                onClick={() => setView("signup")}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. SIGN UP VIEW */}
      {view === "signup" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white py-10 px-8 shadow-sm rounded-2xl border border-slate-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Start your investing journey today.</p>
            </div>

            {signUpError && (
              <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold px-4 py-3 rounded-xl">
                {signUpError}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Enter your full name"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Phone size={18} />
                  </span>
                  <input
                    type="tel"
                    required
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Create Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a password"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Password must be at least 8 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    required
                    value={signUpConfirm}
                    onChange={(e) => setSignUpConfirm(e.target.value)}
                    placeholder="Confirm your password"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-500 font-medium">Already have an account? </span>
              <button
                onClick={() => setView("login")}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer"
              >
                Log in
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. RESET VIA EMAIL OTP WIZARD */}
      {view === "reset-otp" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white py-10 px-8 shadow-sm rounded-2xl border border-slate-100">


            {/* Error Message Alert */}
            {otpError && (
              <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold px-4 py-3 rounded-xl">
                {otpError}
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {otpStep === 1 && (
              <div>
                <div className="text-center mb-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 mb-3">
                    <Mail size={22} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Forgot Password</h2>
                  <p className="text-slate-500 font-medium text-xs mt-1">Enter your email to receive a 4-digit verification code.</p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!resetEmail) {
                    setOtpError("Please enter your email address.");
                    return;
                  }
                  const emailNormalized = resetEmail.toLowerCase().trim();
                  const foundUser = users.find(u => u.email.toLowerCase() === emailNormalized);
                  if (!foundUser) {
                    setOtpError("No registered account found with this email address.");
                    return;
                  }
                  setOtpError("");
                  setOtpStep(2);
                }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Mail size={18} />
                      </span>
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer font-bold"
                  >
                    Send OTP
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Enter OTP */}
            {otpStep === 2 && (
              <div>
                <div className="text-center mb-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 mb-3">
                    <Lock size={22} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Verify OTP</h2>
                  <p className="text-slate-500 font-medium text-xs mt-1">Enter the 4-digit code sent to <span className="font-semibold text-slate-700">{resetEmail}</span></p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (enteredOtp === "0000") {
                    setOtpError("");
                    setOtpStep(3);
                  } else {
                    setOtpError("Invalid verification code. Please try again.");
                  }
                }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">4-Digit Verification Code</label>
                    <div className="relative max-w-[160px] mx-auto">
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="0 0 0 0"
                        className="block w-full py-3.5 text-center border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xl font-extrabold tracking-[0.4em] transition-colors bg-slate-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer font-bold"
                  >
                    Verify Code
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: Reset Password */}
            {otpStep === 3 && (
              <div>
                <div className="text-center mb-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 mb-3">
                    <Lock size={22} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create New Password</h2>
                  <p className="text-slate-500 font-medium text-xs mt-1">Please type your new strong password.</p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (newOtpPassword.length < 8) {
                    setOtpError("Password must be at least 8 characters long.");
                    return;
                  }
                  if (newOtpPassword !== confirmNewOtpPassword) {
                    setOtpError("Passwords do not match.");
                    return;
                  }
                  
                  // Persist the updated password to localStorage database
                  updatePassword(resetEmail, newOtpPassword);

                  setOtpError("");
                  setOtpStep(4);
                }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Lock size={18} />
                      </span>
                      <input
                        type="password"
                        required
                        value={newOtpPassword}
                        onChange={(e) => setNewOtpPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Lock size={18} />
                      </span>
                      <input
                        type="password"
                        required
                        value={confirmNewOtpPassword}
                        onChange={(e) => setConfirmNewOtpPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer font-bold"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {/* STEP 4: Success Screen */}
            {otpStep === 4 && (
              <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 mb-5">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Password Reset Successful!</h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                  Your password has been changed successfully. You can now login using your new password.
                </p>

                <button
                  onClick={() => {
                    setView("login");
                    setOtpStep(1);
                  }}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer font-bold"
                >
                  Return to Login
                </button>
              </div>
            )}

            {/* Back to Login Links for active form steps */}
            {otpStep < 4 && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="w-full flex items-center justify-center gap-2">
                  <span className="h-px bg-slate-100 flex-grow" />
                  <span className="text-xs text-slate-400 uppercase font-semibold">or</span>
                  <span className="h-px bg-slate-100 flex-grow" />
                </div>
                <button
                  onClick={() => {
                    setView("login");
                    setOtpStep(1);
                    setOtpError("");
                  }}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer"
                >
                  Back to previous page
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

    </div>
  );
}
