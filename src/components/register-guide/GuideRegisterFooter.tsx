"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function GuideRegisterFooter() {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="border-t bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 mt-16"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center text-center space-y-6 sm:space-y-4">

                    {/* Legal Links */}
                    <div className="text-sm text-gray-600 space-x-1">
                        <span>By registering as a guide, you agree to our</span>
                        <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                            Terms of Service
                        </Link>
                        <span>and</span>
                        <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                            Privacy Policy
                        </Link>
                    </div>

                    {/* Contact */}
                    <div className="text-sm text-gray-600">
                        Need help? Contact us at{" "}
                        <a
                            href="mailto:support@bdtravelspirit.com"
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            support@bdtravelspirit.com
                        </a>
                    </div>

                    {/* Divider */}
                    <div className="w-full max-w-lg border-t border-gray-200 dark:border-gray-800"></div>

                    {/* Bottom Row */}
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
                        <p>© {new Date().getFullYear()} BD Travel Spirit. All rights reserved.</p>

                        {/* Future-proof: add socials */}
                        <div className="flex items-center gap-4">
                            <Link href="#" aria-label="Facebook" className="hover:text-blue-600 transition-colors">
                                <i className="ri-facebook-fill text-lg"></i>
                            </Link>
                            <Link href="#" aria-label="Twitter" className="hover:text-sky-500 transition-colors">
                                <i className="ri-twitter-x-fill text-lg"></i>
                            </Link>
                            <Link href="#" aria-label="Instagram" className="hover:text-pink-500 transition-colors">
                                <i className="ri-instagram-line text-lg"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
}
