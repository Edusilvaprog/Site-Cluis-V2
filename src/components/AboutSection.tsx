import { motion } from 'framer-motion';
import { Factory, Handshake, MapPinned } from 'lucide-react';
import { MEDIA_ASSETS } from '../data/cluisData';
import { BlurReveal, SpotlightSurface } from './FluidMotion';
import {
  FLUID_EASE,
  TACTILE_SPRING,
  VIEWPORT_CONFIG,
} from './MotionPrimitives';

const ABOUT_PILLARS = [
  {
    icon: Handshake,
    title: 'Atendimento próximo no balcão',
    body: 'Visitas presenciais nas lojas e suporte ágil pelo WhatsApp para conferir códigos, indicar linhas de maior giro e acompanhar cada pedido.',
  },
  {
    icon: MapPinned,
    title: 'Cobertura em 32 municípios',
    body: 'Atuação dedicada em toda a Baixada Santista e no Vale do Ribeira, conhecendo o perfil e a demanda real de cada praça.',
  },
  {
    icon: Factory,
    title: 'Faturamento direto da fábrica',
    body: 'Nota fiscal e boletos emitidos diretamente pela Roma Pincéis, Soprano ou Carbografite no CNPJ da sua loja, sem intermediários.',
  },
];

export function AboutSection() {
  return (
    <section
      id="quem-somos"
      className="band-ice py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        {/* Top Row: Large Background-Free Transparent Cluis Logo + Authentic Story */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_CONFIG}
            transition={{ duration: 0.44, ease: FLUID_EASE }}
            className="flex items-center justify-center py-4 lg:col-span-4"
          >
            <img
              src={MEDIA_ASSETS.logoCluis}
              alt="Cluis Representações Comerciais"
              data-testid="about-cluis-logo"
              className="h-28 w-auto object-contain sm:h-32 lg:h-[144px]"
            />
          </motion.div>

          <div className="lg:col-span-8">
            <BlurReveal>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#285E7B]">
                Quem somos
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[34px]">
                Parceria comercial na região, com negócio direto na fábrica.
              </h2>
            </BlurReveal>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_CONFIG}
              transition={{ duration: 0.42, delay: 0.08, ease: FLUID_EASE }}
              className="mt-4 max-w-3xl space-y-3 text-sm leading-[1.7] text-[#3B505E] sm:text-[15.5px]"
            >
              <p>
                À frente da Cluis Representações, Carlos soma mais de 15 anos de estrada
                no mercado de materiais de construção, tintas, ferragens e elétrica —
                incluindo anos de atuação junto à Tramontina Materiais Elétricos — levando
                atendimento próximo e consultivo para o dia a dia do lojista.
              </p>
              <p>
                Representamos oficialmente a Roma Pincéis, a Soprano e a Carbografite na
                Baixada Santista e no Vale do Ribeira, conectando empresas com CNPJ e
                Inscrição Estadual diretamente às indústrias, da cotação até a chegada da
                mercadoria.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Row: 3 Elevated Interactive Pillar Blocks with Crisp Icons & Hover Scale */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {ABOUT_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 24, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.015, y: -3 }}
                viewport={VIEWPORT_CONFIG}
                transition={{
                  duration: 0.42,
                  delay: idx * 0.08,
                  ease: FLUID_EASE,
                }}
                className="flex"
              >
                <SpotlightSurface
                  tone="light"
                  className="cluis-block cluis-block-interactive group flex w-full flex-col justify-between rounded-2xl p-6"
                >
                  <div className="relative z-10">
                    <motion.span
                      whileHover={{ scale: 1.08 }}
                      transition={TACTILE_SPRING}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3F8] text-[#285E7B] ring-1 ring-[#D1E1EC] transition-colors duration-200 group-hover:bg-[#0D2534] group-hover:text-white group-hover:ring-[#0D2534]"
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </motion.span>
                    <h3 className="mt-4 font-display text-base font-bold text-[#0D2534] sm:text-[17px]">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#425663]">
                      {pillar.body}
                    </p>
                  </div>
                </SpotlightSurface>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
