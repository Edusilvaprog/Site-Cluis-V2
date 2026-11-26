import { useCallback, useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ExternalLink, Loader2, Search } from 'lucide-react';

interface InteractiveGoogleMapProps {
  selectedCity: string;
  isHighDemand: boolean;
}

interface ResolvedCityPlace {
  city: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface DiscoveredStore {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  googleMapsUri?: string;
}

interface PlaceSearchResultItem {
  id?: string;
  displayName?: string | null;
  formattedAddress?: string | null;
  location?: { lat: () => number; lng: () => number } | null;
  googleMapsURI?: string | null;
}

interface PlacesLibraryLike {
  Place: {
    searchByText: (request: {
      textQuery: string;
      fields: string[];
      locationBias?: {
        center: { lat: number; lng: number };
        radius: number;
      };
      maxResultCount?: number;
      language?: string;
      region?: string;
    }) => Promise<{ places?: PlaceSearchResultItem[] }>;
  };
}

// Neutral Brazil coast viewport before the first Places API (New) city lookup completes
const INITIAL_MAP_VIEW = {
  center: { lat: -24.0, lng: -46.8 },
  zoom: 9,
};

function dispatchQuotaWarning() {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
}

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('OverQuotaMapError') ||
    msg.includes('429')
  );
}

function StoreMarker({
  store,
  isOpen,
  onSelect,
  onClose,
}: {
  store: DiscoveredStore;
  isOpen: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: store.lat, lng: store.lng }}
        title={store.name}
        onClick={onSelect}
      >
        <Pin
          background="#16394E"
          borderColor="#FFFFFF"
          glyphColor="#FFFFFF"
          scale={0.85}
        />
      </AdvancedMarker>

      {isOpen && marker && (
        <InfoWindow anchor={marker} maxWidth={240} onCloseClick={onClose}>
          <div className="p-0.5 text-[#0D2534]">
            <p className="text-xs font-bold leading-snug">{store.name}</p>
            {store.address && (
              <p className="mt-1 text-[11px] leading-snug text-[#425663]">
                {store.address}
              </p>
            )}
            {store.googleMapsUri && (
              <a
                href={store.googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#285E7B] hover:underline"
              >
                <span>Abrir no Google Maps</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function CityMapCanvas({
  selectedCity,
  isHighDemand,
}: {
  selectedCity: string;
  isHighDemand: boolean;
}) {
  const map = useMap();
  const placesLib = useMapsLibrary('places') as PlacesLibraryLike | null;
  const loadingStatus = useApiLoadingStatus();
  const [cityMarkerRef, cityMarker] = useAdvancedMarkerRef();

  const cityCacheRef = useRef<Record<string, ResolvedCityPlace>>({});
  const [resolvedCity, setResolvedCity] = useState<ResolvedCityPlace | null>(
    null,
  );
  const [resolvingCity, setResolvingCity] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);
  const [cityInfoOpen, setCityInfoOpen] = useState(true);

  const [stores, setStores] = useState<DiscoveredStore[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [searchingStores, setSearchingStores] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  useEffect(() => {
    setStores([]);
    setActiveStoreId(null);
    setStoreError(null);
    setCityError(null);
    setCityInfoOpen(true);

    const cached = cityCacheRef.current[selectedCity];
    if (cached) {
      setResolvedCity(cached);
      return;
    }

    if (!placesLib) return;

    let cancelled = false;
    setResolvingCity(true);

    placesLib.Place.searchByText({
      textQuery: `${selectedCity}, São Paulo, Brasil`,
      fields: ['id', 'displayName', 'formattedAddress', 'location'],
      maxResultCount: 1,
      language: 'pt-BR',
      region: 'BR',
    })
      .then(({ places }) => {
        if (cancelled) return;
        const first = places?.[0];
        if (!first?.location) {
          setCityError(`Município ${selectedCity} não retornado pela busca.`);
          return;
        }
        const entry: ResolvedCityPlace = {
          city: selectedCity,
          lat: first.location.lat(),
          lng: first.location.lng(),
          formattedAddress:
            first.formattedAddress || `${selectedCity}, SP, Brasil`,
        };
        cityCacheRef.current[selectedCity] = entry;
        setResolvedCity(entry);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isQuotaError(err)) {
          dispatchQuotaWarning();
        }
        setCityError(`Não foi possível centralizar ${selectedCity} agora.`);
      })
      .finally(() => {
        if (!cancelled) setResolvingCity(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCity, placesLib]);

  useEffect(() => {
    if (map && resolvedCity) {
      map.panTo({ lat: resolvedCity.lat, lng: resolvedCity.lng });
      map.setZoom(12);
    }
  }, [map, resolvedCity]);

  const handleSearchStores = useCallback(async () => {
    if (!placesLib || !resolvedCity) return;
    setSearchingStores(true);
    setStoreError(null);
    setActiveStoreId(null);

    try {
      const { places } = await placesLib.Place.searchByText({
        textQuery: `depósito materiais de construção ferragens tintas em ${selectedCity}, SP`,
        fields: [
          'id',
          'displayName',
          'formattedAddress',
          'location',
          'googleMapsURI',
        ],
        locationBias: {
          center: { lat: resolvedCity.lat, lng: resolvedCity.lng },
          radius: 12000,
        },
        maxResultCount: 8,
        language: 'pt-BR',
        region: 'BR',
      });

      const mapped: DiscoveredStore[] = (places ?? [])
        .filter((p: PlaceSearchResultItem) => Boolean(p.location))
        .map((p: PlaceSearchResultItem, idx: number) => ({
          id: p.id || `store-${idx}`,
          name: p.displayName || 'Estabelecimento local',
          address: p.formattedAddress || '',
          lat: p.location!.lat(),
          lng: p.location!.lng(),
          googleMapsUri: p.googleMapsURI ?? undefined,
        }));

      setStores(mapped);
      if (mapped.length === 0) {
        setStoreError('Nenhum estabelecimento encontrado nesta consulta.');
      }
    } catch (err: unknown) {
      if (isQuotaError(err)) {
        dispatchQuotaWarning();
      }
      setStoreError('Não foi possível buscar lojas no momento.');
    } finally {
      setSearchingStores(false);
    }
  }, [placesLib, resolvedCity, selectedCity]);

  if (
    loadingStatus === APILoadingStatus.FAILED ||
    loadingStatus === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <div className="flex h-[380px] w-full flex-col items-center justify-center bg-[#06131C] px-6 text-center text-sm text-[#C2D4DF]">
        <p className="font-semibold text-white">
          Não foi possível carregar o Google Maps interativo.
        </p>
        <p className="mt-1 max-w-sm text-xs text-[#9EB9C8]">
          Verifique sua conexão ou utilize o botão &ldquo;Ver no Google Maps&rdquo; ao lado para abrir {selectedCity}.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[380px] w-full">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={INITIAL_MAP_VIEW.center}
        defaultZoom={INITIAL_MAP_VIEW.zoom}
        gestureHandling="cooperative"
        streetViewControl={false}
        mapTypeControl={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '380px' }}
      >
        {resolvedCity && (
          <>
            <AdvancedMarker
              ref={cityMarkerRef}
              position={{ lat: resolvedCity.lat, lng: resolvedCity.lng }}
              title={resolvedCity.city}
              onClick={() => setCityInfoOpen(true)}
            >
              <Pin
                background="#EA7317"
                borderColor="#0D2534"
                glyphColor="#FFFFFF"
                scale={1.1}
              />
            </AdvancedMarker>

            {cityInfoOpen && cityMarker && (
              <InfoWindow
                anchor={cityMarker}
                maxWidth={240}
                headerContent={
                  <span className="text-xs font-bold text-[#0D2534]">
                    {resolvedCity.city}
                  </span>
                }
                onCloseClick={() => setCityInfoOpen(false)}
              >
                <div className="p-0.5 text-[#0D2534]">
                  <p className="text-[11px] text-[#425663]">
                    {resolvedCity.formattedAddress}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-[#285E7B]">
                    {isHighDemand
                      ? 'Polo de maior demanda · Rota semanal'
                      : 'Atendimento regional Cluis'}
                  </p>
                </div>
              </InfoWindow>
            )}
          </>
        )}

        {stores.map((store) => (
          <StoreMarker
            key={store.id}
            store={store}
            isOpen={activeStoreId === store.id}
            onSelect={() => setActiveStoreId(store.id)}
            onClose={() => setActiveStoreId(null)}
          />
        ))}
      </GoogleMap>

      {/* Top Action Bar inside Google Map Canvas (keeps Google logo & attributions completely unobstructed) */}
      <div className="pointer-events-none absolute top-3 right-14 left-3 z-10 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={searchingStores || resolvingCity || !resolvedCity || !placesLib}
          onClick={() => void handleSearchStores()}
          className="pointer-events-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-xs border border-[#0D2534]/20 bg-[#0D2534]/95 px-3 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-xs transition-colors hover:bg-[#16394E] disabled:opacity-60"
        >
          {searchingStores || resolvingCity ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>
            {resolvingCity
              ? `Localizando ${selectedCity}...`
              : stores.length > 0
                ? `${stores.length} lojas encontradas em ${selectedCity}`
                : `Ver lojas de materiais em ${selectedCity}`}
          </span>
        </button>

        {(storeError || cityError) && (
          <span className="pointer-events-auto rounded-xs bg-[#071722]/90 px-2.5 py-1 text-[11px] text-[#FDE68A]">
            {storeError || cityError}
          </span>
        )}
      </div>
    </div>
  );
}

export function InteractiveGoogleMap({
  selectedCity,
  isHighDemand,
}: InteractiveGoogleMapProps) {
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '').trim();
  const [apiKey, setApiKey] = useState<string>(envKey);
  const [keyResolved, setKeyResolved] = useState<boolean>(Boolean(envKey));

  useEffect(() => {
    if (envKey) return;
    let active = true;
    fetch('/api/maps/config')
      .then((res) => res.json())
      .then((data: { apiKey?: string }) => {
        if (!active) return;
        setApiKey((data.apiKey ?? '').trim());
        setKeyResolved(true);
      })
      .catch(() => {
        if (active) setKeyResolved(true);
      });
    return () => {
      active = false;
    };
  }, [envKey]);

  if (!keyResolved) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center gap-2 bg-[#06131C] text-xs text-[#A8D1E7]">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span>Preparando Google Maps...</span>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="flex h-[380px] w-full flex-col items-center justify-center bg-[#06131C] px-6 text-center text-sm text-[#C2D4DF]">
        <p className="font-semibold text-white">Google Maps em configuração</p>
        <p className="mt-1 max-w-sm text-xs text-[#9EB9C8]">
          Use o botão &ldquo;Ver no Google Maps&rdquo; ao lado para abrir {selectedCity} diretamente no mapa.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="interactive-google-map" className="w-full">
      <APIProvider
        apiKey={apiKey}
        language="pt-BR"
        region="BR"
        libraries={['marker', 'places']}
      >
        <CityMapCanvas
          selectedCity={selectedCity}
          isHighDemand={isHighDemand}
        />
      </APIProvider>
    </div>
  );
}
