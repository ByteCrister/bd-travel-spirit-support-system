"use client";

import { motion } from "framer-motion";
import { FiArrowRight } from 'react-icons/fi';
import { useRouter } from "next/navigation";

const FinalCTAbtn = () => {
    const router = useRouter();
    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onClick={() => router.push('/register-as-guide')}
            className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-105"
        >
            Start Your Application
            <FiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </motion.button>
    )
}

export default FinalCTAbtn