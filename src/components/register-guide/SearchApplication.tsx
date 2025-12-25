"use client";

import React, { useState } from 'react';
import { useRegisterGuideStore } from '@/store/guide-registration.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Loader2, FileSearch, Mail, KeyRound, CheckCircle2, XCircle, AlertCircle, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchApplication: React.FC = () => {
    const {
        fetchAndFillApplication,
        clearSearchedApplication,
        hasSearchedApplication,
        isSearching,
        searchError,
    } = useRegisterGuideStore();

    const [email, setEmail] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleFetchApplication = async () => {
        setShowSuccess(false);
        const result = await fetchAndFillApplication(email, accessToken);
        if (result && !searchError) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        }
    };

    const handleClearSearch = () => {
        clearSearchedApplication();
        setEmail('');
        setAccessToken('');
        setShowSuccess(false);
    };

    const isFormValid = email.trim() !== '' && accessToken.trim() !== '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto mb-8"
        >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 overflow-hidden">
                {/* Decorative top border */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <CardHeader className="pb-4 relative">
                    <div className="flex items-start gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-blue-200/50">
                                <FileSearch className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                                Continue Your Application
                            </CardTitle>
                            <CardDescription className="text-base text-gray-600">
                                Already started? Load your saved application using your email and access token
                            </CardDescription>
                        </div>
                    </div>

                    {/* Clear Button - Appears when hasSearchedApplication is true */}
                    <AnimatePresence>
                        {hasSearchedApplication && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-6 right-6"
                            >
                                <Button
                                    onClick={handleClearSearch}
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200/60 shadow-sm hover:shadow-md transition-all group"
                                    aria-label="Clear search and start new"
                                >
                                    <div className="relative">
                                        <X className="h-5 w-5 text-gray-500 group-hover:text-red-500 transition-colors" strokeWidth={2.5} />
                                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-pink-500/0 group-hover:from-red-500/10 group-hover:to-pink-500/10 rounded-full transition-all" />
                                    </div>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Info Banner */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <AlertCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 text-sm">
                                <p className="font-semibold text-blue-900 mb-1">Looking for your saved application?</p>
                                <p className="text-blue-700 leading-relaxed">
                                    Enter the email address you used and the access token that was sent to your email when you first started your application.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Input Fields */}
                    <div className="grid md:grid-cols-2 gap-5">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-2"
                        >
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-600" />
                                Email Address
                            </Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSearching}
                                    className="h-11 pl-4 pr-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2"
                        >
                            <Label htmlFor="accessToken" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-purple-600" />
                                Access Token
                            </Label>
                            <div className="relative">
                                <Input
                                    id="accessToken"
                                    type="text"
                                    placeholder="Enter your access token"
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                    disabled={isSearching}
                                    className="h-11 pl-4 pr-4 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 font-mono text-sm"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Load Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button
                            onClick={handleFetchApplication}
                            disabled={isSearching || !isFormValid}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 hover:from-blue-700 hover:via-blue-700 hover:to-purple-700 font-semibold text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isSearching ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Loading Your Application...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Search className="w-5 h-5" />
                                    <span>Load Application</span>
                                </span>
                            )}
                        </Button>
                    </motion.div>

                    {/* Success/Error Messages */}
                    <AnimatePresence mode="wait">
                        {showSuccess && !searchError && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Alert className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" strokeWidth={2.5} />
                                    <AlertDescription className="text-green-800 font-medium ml-2">
                                        Application loaded successfully! Your form has been filled with your saved data.
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        {searchError && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Alert className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-md">
                                    <XCircle className="h-5 w-5 text-red-600" strokeWidth={2.5} />
                                    <AlertDescription className="text-red-800 font-medium ml-2">
                                        {searchError}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Helper Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center pt-2"
                    >
                        <p className="text-sm text-gray-500">
                            Don&apos;t have an access token? Check your email or start a new application below.
                        </p>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default SearchApplication;