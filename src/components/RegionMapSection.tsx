import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, MapPin, Search, X } from 'lucide-react';
import { type RegionId } from '../data/cluisData';
import {
  BAIXADA_POLYGONS,
  VALE_POLYGONS,
  type MapCityPolygon,
} from '../data/mapPolygons';
import {
  computeMapCalloutLayout,
  type SvgViewBox,
} from '../utils/mapLabelLayout';
import { BlurReveal } from './FluidMotion';
import {
  FLUID_SPRING,
  mapPinCalloutVariants,
  mapPolygonVariants,
  mapSvgContainerVariants,
} from './MotionPrimitives';
import { InteractiveGoogleMap } from './InteractiveGoogleMap';

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
    countLabel: '9 municípios',
    defaultCity: 'Praia Grande',
    polygons: BAIXADA_POLYGONS,
  },
  vale: {
    title: 'Vale do Ribeira',
    countLabel: '23 municípios',
    defaultCity: 'Registro',
    polygons: VALE_POLYGONS,
  },
};

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function RegionMapSection() {
  const [activeRegion, setActiveRegion] = useState<RegionId>('baixada');
  const [selectedCity, setSelectedCity] = useState<string>('Praia Grande');
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [cityQuery, setCityQuery] = useState('');
  const [mapViewMode, setMapViewMode] = useState<'regional' | 'google'>(
    'regional',
  );

  const region = REGION_META[activeRegion];
  const displayCity = hoveredCity ?? selectedCity;
  const vb = UNIFIED_VIEWBOX;

  const filteredCities = useMemo(() => {
    const q = normalizeSearch(cityQuery);
    if (!q) return region.polygons;
    return region.polygons.filter((city) =>
      normalizeSearch(city.name).includes(q),
    );
  }, [region.polygons, cityQuery]);

  const handleRegionSwitch = (nextRegion: RegionId) => {
    setActiveRegion(nextRegion);
    setSelectedCity(REGION_META[nextRegion].defaultCity);
    setHoveredCity(null);
    setCityQuery('');
  };

  return (
    <section
      id="atuacao"
      className="band-obsidian py-14 text-white sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1376px] px-4 sm:px-6 lg:px-8">
        {/* Clean Editorial Header Row + High-Contrast Region Switcher */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <BlurReveal>
            <p className="text-xs font-semibold tracking-[0.06em] uppercase text-[#8FC5E3]">
              Cobertura comercial
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.025em] text-white sm:text-3xl lg:text-[34px]">
              Presença ativa na Baixada Santista e no Vale do Ribeira.
            </h2>
          </BlurReveal>

          <div
            role="tablist"
            aria-label="Selecionar região de atuação"
            className="inline-flex w-fit items-center gap-1 rounded-2xl border border-white/14 bg-[#0D2434] p-1.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)]"
          >
            {(
              [
                { id: 'baixada', label: 'Baixada Santista', count: '9' },
                { id: 'vale', label: 'Vale do Ribeira', count: '23' },
              ] as const
            ).map((tab) => {
              const active = activeRegion === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleRegionSwitch(tab.id)}
                  className={`relative inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-150 sm:text-sm ${
                    active ? 'text-[#0B2231]' : 'text-[#C2D7E5] hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="region-tab-pill"
                      transition={FLUID_SPRING}
                      className="absolute inset-0 rounded-xl bg-white shadow-[0_6px_16px_rgba(0,0,0,0.28)]"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span
                    className={`relative z-10 text-[11px] font-bold tabular-nums ${
                      active ? 'text-[#285E7B]' : 'text-[#89B4CC]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expanded Visualization-First Workspace: Compact Selector (4 cols) + Wide Map Canvas (8 cols) */}
        <div className="mt-7 grid grid-cols-1 overflow-hidden rounded-3xl border border-white/14 bg-[#0B202F] shadow-[0_24px_60px_rgba(2,10,16,0.5)] lg:grid-cols-12 lg:items-stretch">
          {/* Left Panel: Clean City Filter + Complete Municipality Selector Only */}
          <div className="flex flex-col border-b border-white/10 p-5 sm:p-6 lg:col-span-4 lg:border-r lg:border-b-0">
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2">
                  <Compass
                    className="h-4 w-4 text-[#8FC5E3]"
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-base font-semibold text-white">
                    Escolha uma cidade
                  </h3>
                </div>
                <span className="text-xs font-medium text-[#9AC2D8] tabular-nums">
                  {region.countLabel}
                </span>
              </div>

              {/* Practical Municipality Filter (Search Any of the 32 Cities Instantly) */}
              <div className="relative mt-3.5">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#89AFC4]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder={`Buscar em ${region.title}...`}
                  aria-label={`Filtrar cidades em ${region.title}`}
                  className="w-full rounded-xl border border-white/12 bg-[#071824] py-2.5 pr-8 pl-9 text-xs text-white placeholder:text-[#7FA4BA] transition-colors focus:border-[#8FC5E3] focus:outline-none"
                />
                {cityQuery && (
                  <button
                    type="button"
                    onClick={() => setCityQuery('')}
                    aria-label="Limpar busca de cidade"
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-[#89AFC4] hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Complete Scroll-Safe City Grid (Shows All 9 Baixada or All 23 Vale Municipalities) */}
              <div className="mt-4 grid max-h-[388px] grid-cols-2 gap-2 overflow-y-auto pr-0.5">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => {
                    const isSelected = selectedCity === city.name;
                    const isHovered = hoveredCity === city.name;

                    return (
                      <button
                        key={city.name}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedCity(city.name)}
                        onMouseEnter={() => setHoveredCity(city.name)}
                        onMouseLeave={() => setHoveredCity(null)}
                        className={`relative flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-center text-[12.5px] transition-colors duration-150 ${
                          isSelected
                            ? 'border-[#EA7317] bg-[#EA7317] font-semibold text-white shadow-[0_6px_16px_rgba(234,115,23,0.28)]'
                            : isHovered
                              ? 'border-[#A8D1E7]/70 bg-white/[0.12] font-medium text-white'
                              : 'border-white/12 bg-white/[0.04] font-medium text-[#E4EFF5] hover:border-white/35 hover:bg-white/[0.09]'
                        }`}
                      >
                        {isSelected && (
                          <MapPin
                            className="h-3.5 w-3.5 shrink-0 text-white"
                            aria-hidden="true"
                          />
                        )}
                        <span className="truncate">{city.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <p className="col-span-2 py-6 text-center text-xs text-[#9ABBD0]">
                    Nenhuma cidade encontrada para &ldquo;{cityQuery}&rdquo;.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Expansive Interactive Map Visualization (8 Columns) */}
          <div className="cartographic-grid relative flex min-h-[440px] flex-col bg-[#06141E] lg:col-span-8 lg:min-h-[500px]">
            {/* Minimal Top Visualization Mode Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 bg-[#091D2B]/90 px-5 py-3 text-xs">
              <div
                role="group"
                aria-label="Modo de visualização do mapa"
                className="inline-flex items-center rounded-xl border border-white/14 bg-[#06131C] p-1"
              >
                <button
                  type="button"
                  onClick={() => setMapViewMode('regional')}
                  aria-pressed={mapViewMode === 'regional'}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
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
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    mapViewMode === 'google'
                      ? 'bg-white text-[#0D2534]'
                      : 'text-[#B8D9EA] hover:text-white'
                  }`}
                >
                  Google Maps
                </button>
              </div>

              <span className="inline-flex items-center gap-2 text-xs font-medium text-[#D2E4EF]">
                <MapPin
                  className={`h-3.5 w-3.5 ${
                    hoveredCity && hoveredCity !== selectedCity
                      ? 'text-[#A8D1E7]'
                      : 'text-[#EA7317]'
                  }`}
                  aria-hidden="true"
                />
                <span>
                  {hoveredCity ? 'Visualizando:' : 'Selecionada:'}{' '}
                  <strong
                    data-testid="map-display-city"
                    className="font-semibold text-white"
                  >
                    {displayCity}
                  </strong>
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
              <div className="relative flex flex-1 items-center justify-center p-4 sm:p-6">
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
                    className="h-auto max-h-[440px] w-full select-none"
                  >
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

                    {/* Clamped Municipality Callout Pill with Leader Stem */}
                    <AnimatePresence mode="wait">
                      {(() => {
                        const activePoly = region.polygons.find(
                          (p) => p.name === displayCity,
                        );
                        if (!activePoly) return null;
                        const isHoveredOnly =
                          Boolean(hoveredCity) && hoveredCity !== selectedCity;
                        const accentStroke = isHoveredOnly
                          ? '#A8D1E7'
                          : '#EA7317';
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

                    {/* Crisp North Compass */}
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
                      fontFamily="Plus Jakarta Sans, sans-serif"
                      fontSize="10"
                      fontWeight="600"
                      fill="#9ACAE8"
                      opacity="0.85"
                      textAnchor="middle"
                    >
                      N
                    </text>
                  </motion.svg>
                </AnimatePresence>

                <span className="pointer-events-none absolute right-5 bottom-3.5 text-[11px] font-medium text-[#8EB3C9]">
                  Clique em qualquer município no mapa
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
