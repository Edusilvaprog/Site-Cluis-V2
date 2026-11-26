import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { type RegionId } from '../data/cluisData';
import {
  BAIXADA_POLYGONS,
  VALE_POLYGONS,
  type MapCityPolygon,
} from '../data/mapPolygons';
import { computeMapCalloutLayout, type SvgViewBox } from '../utils/mapLabelLayout';
import { MapPinRouteSvg } from './CluisIcons';
import { BlurReveal, SpotlightSurface } from './FluidMotion';
import {
  FLUID_EASE,
  FLUID_SPRING,
  mapPinCalloutVariants,
  mapPolygonVariants,
  mapSvgContainerVariants,
  regionCityButtonVariants,
  regionCityGridVariants,
  TACTILE_SPRING,
} from './MotionPrimitives';
import { InteractiveGoogleMap } from './InteractiveGoogleMap';

const EXTRA_VALE_GRID_CITY = 'Pedro de Toledo';

const UNIFIED_VIEWBOX: SvgViewBox = { x: 36, y: 8, w: 468, h: 316 };
const COMPASS_POS = { x: 478, y: 274 };

const REGION_META: Record<
  RegionId,
  {
    title: string;
    countLabel: string;
    defaultCity: string;
    polygons: MapCityPolygon[];
  }
> = {
  baixada: {
    title: 'Baixada Santista',
    countLabel: '9 cidades',
    defaultCity: 'Praia Grande',
    polygons: BAIXADA_POLYGONS,
  },
  vale: {
    title: 'Vale do Ribeira',
    countLabel: '23 cidades',
    defaultCity: 'Registro',
    polygons: VALE_POLYGONS,
  },
};

export function RegionMapSection() {
  const [activeRegion, setActiveRegion] = useState<RegionId>('baixada');
  const [selectedCity, setSelectedCity] = useState<string>('Praia Grande');
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'regional' | 'google'>('regional');

  const region = REGION_META[activeRegion];
  const visibleCityButtons = region.polygons.filter(
    (city) =>
      city.featured ||
      (activeRegion === 'vale' && city.name === EXTRA_VALE_GRID_CITY),
  );
  const displayCity = hoveredCity ?? selectedCity;
  const vb = UNIFIED_VIEWBOX;

  const selectedCityMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
    `${selectedCity}, SP`,
  )}`;

  const handleRegionSwitch = (nextRegion: RegionId) => {
    setActiveRegion(nextRegion);
    setSelectedCity(REGION_META[nextRegion].defaultCity);
    setHoveredCity(null);
  };

  return (
    <section
      id="atuacao"
      className="band-obsidian py-14 text-white sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        {/* Crisp Editorial Header Row + Region Switcher */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <BlurReveal>
            <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-[#A8D1E7]">
              Área de atuação
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl lg:text-[34px]">
              Baixada Santista e Vale do Ribeira.
            </h2>
          </BlurReveal>

          {/* Region Switcher with Spring Layout Pill */}
          <div
            role="tablist"
            aria-label="Selecionar região de atuação"
            className="inline-flex w-fit items-center gap-1 rounded-xl border border-white/14 bg-[#0B2231] p-1"
          >
            {(
              [
                { id: 'baixada', label: 'Baixada Santista (9)' },
                { id: 'vale', label: 'Vale do Ribeira (23)' },
              ] as const
            ).map((tab) => {
              const active = activeRegion === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRegionSwitch(tab.id)}
                  className={`relative min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-150 sm:text-sm ${
                    active ? 'text-[#0D2534]' : 'text-[#C2D4DF] hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="region-tab-pill"
                      transition={FLUID_SPRING}
                      className="absolute inset-0 rounded-lg bg-white"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Unified Interactive Map & Selection Frame */}
        <div className="mt-5">
          <SpotlightSurface className="grid grid-cols-1 overflow-hidden rounded-2xl border border-white/14 bg-[#0B202E] shadow-[0_20px_48px_rgba(3,12,18,0.42)] lg:grid-cols-12 lg:items-stretch">
            {/* Left Panel: Clean City Selection Matrix Only + Google Maps Link */}
            <div className="relative z-10 flex flex-col justify-between border-b border-white/12 p-5 sm:p-6 lg:col-span-5 lg:border-r lg:border-b-0">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[11px] font-semibold tracking-[0.06em] uppercase text-[#A8D1E7]">
                    Selecione a cidade
                  </p>
                  <span className="font-mono text-[11px] text-[#9EB9C8] tabular-nums">
                    {region.countLabel}
                  </span>
                </div>

                {/* Uniform City Selection Grid */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`grid-${activeRegion}`}
                    variants={regionCityGridVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
                  >
                    {visibleCityButtons.map((city) => {
                      const isSelected = selectedCity === city.name;
                      const isHovered = hoveredCity === city.name;

                      return (
                        <motion.button
                          key={city.name}
                          type="button"
                          variants={regionCityButtonVariants}
                          aria-pressed={isSelected}
                          whileHover={{ y: -1.5 }}
                          whileTap={{ scale: 0.96 }}
                          transition={TACTILE_SPRING}
                          onClick={() => setSelectedCity(city.name)}
                          onMouseEnter={() => setHoveredCity(city.name)}
                          onMouseLeave={() => setHoveredCity(null)}
                          className={`relative flex min-h-[40px] items-center justify-center overflow-hidden rounded-lg border px-2.5 py-1.5 text-center text-[13px] transition-colors duration-150 ${
                            isSelected
                              ? 'border-[#EA7317] font-semibold text-white'
                              : isHovered
                                ? 'border-[#A8D1E7]/70 bg-white/[0.12] font-medium text-white'
                                : 'border-white/12 bg-white/[0.04] font-medium text-[#E4EDF2] hover:border-white/40 hover:bg-white/[0.10]'
                          }`}
                        >
                          {isSelected && (
                            <motion.span
                              layoutId={`active-city-pill-${activeRegion}`}
                              transition={FLUID_SPRING}
                              aria-hidden="true"
                              className="absolute inset-0 bg-[#EA7317]"
                            />
                          )}
                          <span className="relative z-10 truncate">{city.name}</span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Clean Footer: Selected City + Google Maps Action */}
              <div className="mt-5 border-t border-white/12 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9EB9C8]">
                      Cidade selecionada
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={selectedCity}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.16, ease: FLUID_EASE }}
                        className="mt-0.5 font-display text-xl font-bold text-white"
                      >
                        {selectedCity}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  <motion.a
                    href={selectedCityMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={TACTILE_SPRING}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#0D2534] whitespace-nowrap shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition-colors duration-150 hover:bg-[#DCEBF4] sm:text-sm"
                  >
                    <MapPinRouteSvg className="h-4 w-4 shrink-0 text-[#285E7B]" />
                    <span>Ver no Google Maps</span>
                  </motion.a>
                </div>
              </div>
            </div>

            {/* Right Panel: Interactive Map Canvas (Regional SVG or Google Maps) */}
            <div className="cartographic-grid relative z-10 flex flex-col justify-between bg-[#06131C] lg:col-span-7">
              {/* Cartographic Header Strip + View Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 bg-[#091C29]/90 px-4 py-2.5 text-xs sm:px-5">
                <div
                  role="group"
                  aria-label="Modo de visualização do mapa"
                  className="inline-flex items-center rounded-lg border border-white/15 bg-[#06131C] p-0.5"
                >
                  <button
                    type="button"
                    onClick={() => setMapViewMode('regional')}
                    aria-pressed={mapViewMode === 'regional'}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      mapViewMode === 'regional'
                        ? 'bg-white text-[#0D2534]'
                        : 'text-[#B8D9EA] hover:text-white'
                    }`}
                  >
                    Mapa Regional
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapViewMode('google')}
                    aria-pressed={mapViewMode === 'google'}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      mapViewMode === 'google'
                        ? 'bg-white text-[#0D2534]'
                        : 'text-[#B8D9EA] hover:text-white'
                    }`}
                  >
                    Google Maps
                  </button>
                </div>

                <span className="inline-flex items-center gap-2 font-mono text-white">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      hoveredCity && hoveredCity !== selectedCity
                        ? 'bg-[#D2E9F8]'
                        : 'bg-[#EA7317]'
                    }`}
                    aria-hidden="true"
                  />
                  <span>
                    {hoveredCity ? 'Visualizando:' : 'Selecionada:'}{' '}
                    <strong data-testid="map-display-city">{displayCity}</strong>
                  </span>
                </span>
              </div>

              {mapViewMode === 'google' ? (
                <div className="relative flex flex-1 items-stretch">
                  <InteractiveGoogleMap
                    selectedCity={selectedCity}
                    isHighDemand={false}
                  />
                </div>
              ) : (
                <div className="relative flex flex-1 items-center justify-center px-3 py-3 sm:px-6">
                  <AnimatePresence mode="wait">
                    <motion.svg
                      key={activeRegion}
                      variants={mapSvgContainerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
                      role="img"
                      aria-label={`Mapa interativo de ${region.title}.`}
                      className="h-auto max-h-[340px] w-full select-none"
                    >
                      <defs>
                        <filter
                          id="cluis-orange-glow"
                          x="-20%"
                          y="-20%"
                          width="140%"
                          height="140%"
                        >
                          <feDropShadow
                            dx="0"
                            dy="0"
                            stdDeviation="4.5"
                            floodColor="#EA7317"
                            floodOpacity="0.6"
                          />
                        </filter>
                        <filter
                          id="cluis-label-shadow"
                          x="-20%"
                          y="-30%"
                          width="140%"
                          height="160%"
                        >
                          <feDropShadow
                            dx="0"
                            dy="3"
                            stdDeviation="3"
                            floodColor="#02090F"
                            floodOpacity="0.65"
                          />
                        </filter>
                      </defs>

                      <g fillRule="evenodd" strokeLinejoin="round">
                        {region.polygons.map((poly) => {
                          const isSelected = selectedCity === poly.name;
                          const isHovered = hoveredCity === poly.name;
                          const visualState = isSelected
                            ? 'selected'
                            : isHovered
                              ? 'hovered'
                              : 'idle';

                          return (
                            <motion.path
                              key={poly.name}
                              d={poly.d}
                              variants={mapPolygonVariants}
                              initial={false}
                              animate={visualState}
                              whileTap={{ fillOpacity: 0.84 }}
                              filter={isSelected ? 'url(#cluis-orange-glow)' : undefined}
                              role="button"
                              tabIndex={0}
                              aria-label={`Selecionar ${poly.name}`}
                              aria-pressed={isSelected}
                              onClick={() => setSelectedCity(poly.name)}
                              onMouseEnter={() => setHoveredCity(poly.name)}
                              onMouseLeave={() => setHoveredCity(null)}
                              onFocus={() => setHoveredCity(poly.name)}
                              onBlur={() => setHoveredCity(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setSelectedCity(poly.name);
                                }
                              }}
                              className="cursor-pointer focus:outline-none focus-visible:outline-none"
                            >
                              <title>{poly.name}</title>
                            </motion.path>
                          );
                        })}
                      </g>

                      {/* Strictly Clamped Municipality Callout Pill with Leader Stem */}
                      <AnimatePresence mode="wait">
                        {(() => {
                          const activePoly = region.polygons.find(
                            (p) => p.name === displayCity,
                          );
                          if (!activePoly) return null;
                          const isHoveredOnly =
                            Boolean(hoveredCity) && hoveredCity !== selectedCity;
                          const accentStroke = isHoveredOnly ? '#A8D1E7' : '#EA7317';
                          const layout = computeMapCalloutLayout(
                            activePoly.name,
                            activePoly.cx,
                            activePoly.cy,
                            vb,
                          );

                          return (
                            <motion.g
                              key={`pin-${activeRegion}-${activePoly.name}`}
                              data-testid="map-city-callout"
                              variants={mapPinCalloutVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="pointer-events-none"
                            >
                              <line
                                x1={activePoly.cx}
                                y1={activePoly.cy}
                                x2={layout.stemX}
                                y2={layout.stemY}
                                stroke={accentStroke}
                                strokeWidth="1.4"
                                strokeOpacity="0.85"
                              />
                              {!isHoveredOnly && (
                                <motion.circle
                                  cx={activePoly.cx}
                                  cy={activePoly.cy}
                                  fill="none"
                                  stroke="#EA7317"
                                  strokeWidth="1.8"
                                  initial={{ r: 4.5, opacity: 0.9 }}
                                  animate={{ r: 16, opacity: 0 }}
                                  transition={{ duration: 0.58, ease: FLUID_EASE }}
                                />
                              )}
                              <circle
                                cx={activePoly.cx}
                                cy={activePoly.cy}
                                r={4.2}
                                fill="#FFFFFF"
                                stroke="#0D2534"
                                strokeWidth="1.6"
                              />
                              <rect
                                x={layout.boxX}
                                y={layout.boxY}
                                width={layout.boxWidth}
                                height={layout.boxHeight}
                                rx={12.5}
                                fill="#071722"
                                fillOpacity={0.96}
                                stroke={accentStroke}
                                strokeWidth="1.25"
                                filter="url(#cluis-label-shadow)"
                              />
                              <text
                                x={layout.textX}
                                y={layout.textY}
                                textAnchor="middle"
                                fill="#FFFFFF"
                                fontSize="11"
                                fontWeight="600"
                                fontFamily="Plus Jakarta Sans, sans-serif"
                              >
                                {activePoly.name}
                              </text>
                            </motion.g>
                          );
                        })()}
                      </AnimatePresence>

                      {/* Crisp North Compass Placed in Open Bottom-Right Quadrant */}
                      <g
                        transform={`translate(${COMPASS_POS.x} ${COMPASS_POS.y})`}
                        fill="none"
                        stroke="#9ACAE8"
                        strokeWidth="1.35"
                        opacity="0.82"
                      >
                        <path d="M0 22V4m-4.5 5.5L0 4l4.5 5.5" />
                      </g>
                      <text
                        x={COMPASS_POS.x}
                        y={COMPASS_POS.y - 5}
                        fontFamily="IBM Plex Mono, monospace"
                        fontSize="10"
                        fill="#9ACAE8"
                        opacity="0.85"
                        textAnchor="middle"
                      >
                        N
                      </text>
                    </motion.svg>
                  </AnimatePresence>
                </div>
              )}

              {/* Minimal Cartographic Legend Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#091C29]/90 px-5 py-2.5 text-xs text-[#9AC2D8]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#EA7317]" aria-hidden="true" />
                  <span>Cidade selecionada</span>
                </span>
                <span className="font-mono text-[11px] text-[#B8D9EA]">
                  Clique no mapa para selecionar
                </span>
              </div>
            </div>
          </SpotlightSurface>
        </div>
      </div>
    </section>
  );
}
