'use client';

import { motion } from 'framer-motion';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { AuthForm, AuthFormData } from './AuthForm';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (data: AuthFormData) => {
    try {
      const res = await axios.post('/api/auth/login', data);
      localStorage.setItem('accessToken', res.data.accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
      router.push('/agent-chat');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-indigo-50 to-indigo-100 flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* Background Bubbles */}
      <motion.div
        className="absolute top-16 left-1/3 w-36 h-36 bg-indigo-200 rounded-full blur-2xl opacity-50"
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 right-1/4 w-44 h-44 bg-teal-200 rounded-full blur-2xl opacity-50"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Card */}
      <motion.div
        className="bg-white border border-indigo-100 rounded-3xl shadow-xl w-full max-w-md p-10"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 80, damping: 12 }}
      >
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6 tracking-tight">
          Agent Sign In
        </h1>
        <AuthForm onSubmit={handleLogin} />
      </motion.div>
    </div>
  );
}
