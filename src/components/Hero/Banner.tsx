"use client";

// components/HeroBanner.tsx
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroBanner() {
    return (
        <section className="relative w-full h-[60vh] md:h-[80vh] lg:h-screen overflow-hidden">
            <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
            >
                <Image
                    src="/logo.jpeg"
                    alt="Ocean wave"
                    layout="fill"
                    objectFit="cover"
                    priority
                    className="brightness-75"
                />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <div className="text-white max-w-2xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-3xl md:text-5xl font-bold mb-4"
                    >
                        Explore a Força do Oceano
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-xl mb-6"
                    >
                        Descubra a beleza e energia das águas em movimento.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <a
                            href="#descubra"
                            className="inline-block bg-white text-blue-900 font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-100 transition-colors duration-300"
                        >
                            Saiba Mais
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}