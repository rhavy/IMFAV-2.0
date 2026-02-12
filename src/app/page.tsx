"use client";

import React from 'react';
import { Menu, MapPin, Clock, Phone, ChevronRight, Heart, Users, Calendar } from 'lucide-react';
import HeroBanner from '@/components/Hero/Banner';
import Navbar from '@/components/header/Navbar';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" as const }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.2 } },
  viewport: { once: true, margin: "-100px" }
};

const floating = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 overflow-x-hidden">

      <HeroBanner />

      {/* --- SOBRE A LIDERANÇA --- */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
          {...fadeInUp}
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="absolute -top-6 -left-6 w-full h-full bg-blue-50 rounded-3xl -z-10"
            ></motion.div>
            <img
              src="/lideranca.png"
              alt="Pastores"
              className="rounded-3xl shadow-2xl w-full object-cover transform hover:scale-[1.02] transition duration-500"
            />
          </div>
          <div>
            <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Nossa Liderança</span>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mt-2 mb-8 leading-tight">Guiados por Amor e Propósito</h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Nossos pastores dedicam suas vidas ao cuidado das ovelhas e ao ensino fiel das Escrituras.
              Acreditamos que cada pessoa é uma fonte de águas vivas que pode transformar o ambiente onde está inserida.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <motion.div
                  variants={floating}
                  animate="animate"
                  className="bg-blue-100 p-3 rounded-full shadow-lg shadow-blue-500/10"
                >
                  <Heart className="text-blue-600 w-6 h-6" />
                </motion.div>
                <span className="font-semibold text-slate-700 text-lg">Acolhimento Familiar</span>
              </div>
              <div className="flex items-center gap-4">
                <motion.div
                  variants={floating}
                  animate="animate"
                  className="bg-blue-100 p-3 rounded-full shadow-lg shadow-blue-500/10"
                >
                  <Users className="text-blue-600 w-6 h-6" />
                </motion.div>
                <span className="font-semibold text-slate-700 text-lg">Ministérios para todas as idades</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- CULTOS --- */}
      <section id="cultos" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div {...fadeInUp}>
            <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Nossas Celebrações</span>
            <h2 className="text-3xl md:text-5xl font-bold text-blue-900 mt-2 mb-16">Horários dos Cultos</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { title: "Culto de Família", time: "Domingos às 10h", icon: <Calendar className="text-blue-600 w-7 h-7" />, desc: "Um tempo precioso para toda a família buscar a presença de Deus.", preset: "white" },
              { title: "Celebração de Vida", time: "Domingos às 19h", icon: <Calendar className="text-white w-7 h-7" />, desc: "Nosso principal encontro semanal de adoração e palavra.", preset: "blue" },
              { title: "Escola Bíblica", time: "Quartas às 20h", icon: <Calendar className="text-blue-600 w-7 h-7" />, desc: "Aprofundando no conhecimento da Palavra de Deus.", preset: "white" }
            ].map((culto, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`${culto.preset === 'blue' ? 'bg-blue-600 text-white md:scale-110 z-10' : 'bg-white border border-slate-100 text-slate-800'} p-10 rounded-3xl shadow-xl transition-all duration-300 group`}
              >
                <motion.div
                  variants={floating}
                  animate="animate"
                  className={`${culto.preset === 'blue' ? 'bg-white/20' : 'bg-blue-100'} w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner`}
                >
                  {culto.icon}
                </motion.div>
                <h3 className="text-2xl font-bold mb-3">{culto.title}</h3>
                <p className={`${culto.preset === 'blue' ? 'text-blue-200' : 'text-blue-600'} font-bold text-lg mb-6`}>{culto.time}</p>
                <p className={`${culto.preset === 'blue' ? 'text-blue-100' : 'text-slate-500'} italic`}>"{culto.desc}"</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- CARTAZES / EVENTOS --- */}
      <section id="eventos" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
            {...fadeInUp}
          >
            <div>
              <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Acompanhe</span>
              <h2 className="text-3xl md:text-5xl font-bold text-blue-900 mt-2">Próximos Eventos</h2>
            </div>
            <button className="bg-blue-50 text-blue-600 px-6 py-3 rounded-full font-bold flex items-center hover:bg-blue-100 transition duration-300 group">
              Ver todos os eventos <ChevronRight className="ml-1 w-6 h-6 group-hover:translate-x-1 transition" />
            </button>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { cat: "Conferência", title: "Conferência de Mulheres 2025", date: "25 a 27 de Maio", img: "photo-1438232992991-995b7058bbb3" },
              { cat: "Jovens", title: "Noite de Louvor e Adoração", date: "Sábado, 15 de Junho às 19:30", img: "photo-1544928147-79a2dbc1f389" },
              { cat: "Social", title: "Chá de Comunhão", date: "Domingo, 02 de Julho às 16:00", img: "photo-1510590337019-5ef8d3d32116" }
            ].map((event, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] mb-6 shadow-lg group-hover:shadow-[0_20px_50px_rgba(30,58,138,0.2)] transition-all duration-500">
                  <img
                    src={`https://images.unsplash.com/${event.img}?auto=format&fit=crop&q=80`}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition duration-500"></div>
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-3 inline-block">
                      {event.cat}
                    </span>
                    <h3 className="text-2xl font-bold text-white leading-tight">{event.title}</h3>
                  </div>
                </div>
                <p className="text-slate-500 font-medium px-4">{event.date}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- GALERIA --- */}
      <section id="galeria" className="py-24 bg-blue-950 text-white overflow-hidden relative">
        {/* Elementos Decorativos de Fundo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div className="text-center mb-20" {...fadeInUp}>
            <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">Nossa Galeria</span>
            <h2 className="text-4xl md:text-6xl font-extrabold mt-2 tracking-tight">Momentos <span className="text-blue-400">em Família</span></h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              <motion.img variants={fadeInUp} whileHover={{ scale: 1.03 }} src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80" className="rounded-2xl w-full h-56 object-cover hover:opacity-75 cursor-pointer transition duration-500 shadow-2xl" alt="Galeria" />
              <motion.img variants={fadeInUp} whileHover={{ scale: 1.03 }} src="https://images.unsplash.com/photo-1543191878-f68366c89191?auto=format&fit=crop&q=80" className="rounded-2xl w-full h-80 object-cover hover:opacity-75 cursor-pointer transition duration-500 shadow-2xl" alt="Galeria" />
            </div>
            <div className="space-y-6 pt-12 md:pt-24">
              <motion.img variants={fadeInUp} whileHover={{ scale: 1.03 }} src="https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&q=80" className="rounded-2xl w-full h-80 object-cover hover:opacity-75 cursor-pointer transition duration-500 shadow-2xl" alt="Galeria" />
              <motion.img variants={fadeInUp} whileHover={{ scale: 1.03 }} src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80" className="rounded-2xl w-full h-56 object-cover hover:opacity-75 cursor-pointer transition duration-500 shadow-2xl" alt="Galeria" />
            </div>
            <div className="space-y-6">
              <motion.img variants={fadeInUp} whileHover={{ scale: 1.03 }} src="https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&q=80" className="rounded-2xl w-full h-60 object-cover hover:opacity-75 cursor-pointer transition duration-500 shadow-2xl" alt="Galeria" />
              <motion.img variants={fadeInUp} whileHover={{ scale: 1.03 }} src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80" className="rounded-2xl w-full h-80 object-cover hover:opacity-75 cursor-pointer transition duration-500 shadow-2xl" alt="Galeria" />
            </div>
            <div className="space-y-6 pt-12 md:pt-16">
              <motion.img variants={fadeInUp} whileHover={{ scale: 1.03 }} src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80" className="rounded-2xl w-full h-80 object-cover hover:opacity-75 cursor-pointer transition duration-500 shadow-2xl" alt="Galeria" />
              <motion.img variants={fadeInUp} whileHover={{ scale: 1.03 }} src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80" className="rounded-2xl w-full h-56 object-cover hover:opacity-75 cursor-pointer transition duration-500 shadow-2xl" alt="Galeria" />
            </div>
          </motion.div>

          <motion.div
            className="text-center mt-20"
            {...fadeInUp}
          >
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-blue-500/20 transition duration-300">
              Ver Galeria Completa
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- INFO RÁPIDA (CARD AZUL) --- */}
      <section className="bg-slate-50 py-20 border-t border-slate-100">
        <motion.div
          className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-slate-800"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
        >
          {[
            { icon: <Clock className="w-10 h-10" />, title: "Cultos de Celebração", info: "Domingos às 10h e 19h" },
            { icon: <MapPin className="w-10 h-10" />, title: "Nossa Localização", info: "Av. Principal, 123 - Centro" },
            { icon: <Phone className="w-10 h-10" />, title: "Contato Direto", info: "(00) 1234-5678" }
          ].map((item, idx) => (
            <motion.div key={idx} variants={fadeInUp} className="flex items-center gap-6 group">
              <motion.div
                variants={floating}
                animate="animate"
                className="bg-white p-5 rounded-2xl text-blue-600 shadow-xl group-hover:shadow-blue-500/10 transition duration-500"
              >
                {item.icon}
              </motion.div>
              <div>
                <h3 className="font-bold text-2xl mb-1">{item.title}</h3>
                <p className="text-slate-500 text-lg">{item.info}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-white py-16 px-6 text-center">
        <motion.div {...fadeInUp}>
          <img src="/logo.png" alt="Logo" className="h-20 mx-auto mb-8 brightness-0 invert opacity-80" />
          <p className="text-slate-400 text-lg max-w-md mx-auto mb-10 leading-relaxed">
            © 2025 Ministério Fonte de Águas Vivas. <br />
            Transformando vidas através do Evangelho.
          </p>
          <div className="text-sm text-slate-600 font-medium tracking-widest uppercase">
            Desenvolvido com o Sistema IMFAV
          </div>
        </motion.div>
      </footer>
    </div>
  );
};

export default LandingPage;