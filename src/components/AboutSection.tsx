import { motion } from 'framer-motion';
import { MEDIA_ASSETS } from '../data/cluisData';
import { BlurReveal } from './FluidMotion';
import {
  FLUID_EASE,
  TACTILE_SPRING,
  VIEWPORT_CONFIG,
} from './MotionPrimitives';

const ABOUT_PILLARS = [
  {
    index: '01',
    title: 'Mais de 15 anos na região',
    body: 'Experiência prática atendendo depósitos, casas de tintas, ferragens e elétricas na Baixada Santista e no Vale do Ribeira.',
  },
  {
    index: '02',
    title: 'Atendimento de pai para filho',
    body: 'Contato direto com Carlos nas visitas presenciais e Eduardo nas cotações, conferência de códigos e acompanhamento pelo WhatsApp.',
  },
  {
    index: '03',
    title: 'Faturamento direto da fábrica',
    body: 'Nota fiscal e boletos emitidos direto pela Roma Pincéis, Soprano ou Carbografite no CNPJ da sua loja, sem intermediários.',
  },
];

export function AboutSection() {
  return (
    <section
      id="quem-somos"
      className="band-ice py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        {/* Top Row: Prominent Framed Cluis Logo + Authentic Story */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_CONFIG}
            transition={{ duration: 0.44, ease: FLUID_EASE }}
            className="flex items-center justify-center rounded-2xl bg-white px-8 py-10 shadow-[0_16px_40px_rgba(13,37,52,0.07)] ring-1 ring-[#0D2534]/[0.06] sm:py-12 lg:col-span-4"
          >
            <img
              src={MEDIA_ASSETS.logoCluis}
              alt="Cluis Representações Comerciais"
              data-testid="about-cluis-logo"
              className="h-20 w-auto object-contain sm:h-24 lg:h-[96px]"
            />
          </motion.div>

          <div className="lg:col-span-8">
            <BlurReveal>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#285E7B]">
                Quem somos
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[34px]">
                Representação familiar, presente no balcão do lojista.
              </h2>
            </BlurReveal>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_CONFIG}
              transition={{ duration: 0.42, delay: 0.08, ease: FLUID_EASE }}
              className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-[#425663] sm:text-[15.5px]"
            >
              <p>
                A Cluis Representações nasceu da trajetória de Carlos, com mais de 15 anos
                de estrada no mercado regional — incluindo anos representando a Tramontina
                Materiais Elétricos —, e hoje segue em família junto com Eduardo.
              </p>
              <p>
                Representamos oficialmente a Roma Pincéis, a Soprano e a Carbografite para
                empresas com CNPJ e Inscrição Estadual, com visitas presenciais e retorno
                direto no WhatsApp.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Row: 3 Equal-Height Rounded Cards with Staggered Slide-Up Reveal */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {ABOUT_PILLARS.map((pillar, idx) => (
            <motion.article
              key={pillar.index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_CONFIG}
              transition={{
                duration: 0.42,
                delay: idx * 0.08,
                ease: FLUID_EASE,
              }}
              whileHover={{ y: -3 }}
              className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(13,37,52,0.06)] ring-1 ring-[#0D2534]/[0.06] transition-shadow duration-200 hover:shadow-[0_18px_42px_rgba(13,37,52,0.11)]"
            >
              <div>
                <motion.span
                  whileHover={{ scale: 1.06 }}
                  transition={TACTILE_SPRING}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF4F8] font-mono text-xs font-bold text-[#285E7B] tabular-nums transition-colors duration-200 group-hover:bg-[#0D2534] group-hover:text-white"
                >
                  {pillar.index}
                </motion.span>
                <h3 className="mt-4 font-display text-base font-bold text-[#0D2534] sm:text-[17px]">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#425663]">
                  {pillar.body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
