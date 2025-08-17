'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

export const schema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  password: z
    .string()
    .min(6, { message: 'Min 6 characters' })
    .regex(/[A-Z]/, { message: 'One uppercase at least' })
    .regex(/[0-9]/, { message: 'One number at least' })
    .regex(/[^A-Za-z0-9]/, { message: 'One special char' }),
});

export type AuthFormData = z.infer<typeof schema>;

interface AuthFormProps {
  onSubmit: SubmitHandler<AuthFormData>;
}

export function AuthForm({ onSubmit }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({ resolver: zodResolver(schema) });

  const itemVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      className="flex flex-col gap-6 font-sans text-gray-800"
    >
      {['email', 'password'].map((field) => (
        <motion.div
          key={field}
          variants={itemVariant}
          className="relative"
        >
          <input
            type={field}
            {...register(field as "email" | "password")}
            placeholder=" "
            className="
              peer
              w-full h-12 px-2 bg-transparent
              border-b-2 border-gray-300
              text-base text-gray-900 placeholder-transparent
              focus:border-indigo-600 focus:outline-none
              transition-all duration-200 ease-in-out
              tracking-wide
            "
          />

          <label
            className="
              absolute left-2 top-3 text-gray-500 text-base font-medium
              transition-all duration-200 ease-in-out

              peer-placeholder-shown:top-3
              peer-placeholder-shown:text-base
              peer-placeholder-shown:text-gray-400

              peer-focus:-top-2.5
              peer-focus:text-sm
              peer-focus:text-indigo-600

              peer-[&:not(:placeholder-shown)]:-top-2.5
              peer-[&:not(:placeholder-shown)]:text-sm
              peer-[&:not(:placeholder-shown)]:text-indigo-600
            "
          >
            {field[0].toUpperCase() + field.slice(1)}
          </label>

          {errors[field as 'email' | 'password'] && (
            <p className="mt-1 text-sm text-red-500 font-medium tracking-tight">
              {errors[field as 'email' | 'password']!.message}
            </p>
          )}
        </motion.div>
      ))}

      <motion.button
        type="submit"
        variants={itemVariant}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="
          relative overflow-hidden rounded-lg bg-indigo-600 py-3
          text-white font-semibold tracking-wide shadow-md
          hover:bg-indigo-700 transition-colors duration-200
        "
      >
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        <span className="relative z-10">Sign In</span>
      </motion.button>
    </motion.form>
  );
}
