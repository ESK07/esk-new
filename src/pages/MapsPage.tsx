/// <reference types="google.maps" />
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  AlertTriangle,
  Compass,
  MapPin,
  Navigation,
  Phone,
  Route as RouteIcon,
} from 'lucide-react';
import { COMPANY_INFO } from '../data/eskData';

interface HubLocation {
  id: string;
  name: string;
  city: string;
  role: string;
  coordinates: google.maps.LatLngLiteral;
  slaWindow: string;
  services: string;
  isHq?: boolean;
}

const HARARE_HQ: google.maps.LatLngLiteral = { lat: -17.8252, lng: 31.0335 };

const ESK_ZIMBABWE_HUBS: HubLocation[] = [
  {
    id: 'harare-hq',
    name: 'ESK Systems Harare Operations HQ',
    city: 'Harare CBD',
    role: 'Primary Engineering Desk & Hardware Repair Lab',
    coordinates: HARARE_HQ,
    slaWindow: '15-min Critical Dispatch · Same-Day Walk-In',
    services: 'Hardware Diagnostics ($10+), Software Engineering, Paynow/EcoCash Integration',
    isHq: true,
  },
  {
    id: 'msasa-fiber',
    name: 'Msasa Industrial Fibre & Warehouse Node',
    city: 'Msasa, Harare East',
    role: 'Industrial Estate Dual-WAN & Logistics Support',
    coordinates: { lat: -17.8407, lng: 31.1162 },
    slaWindow: '1-Hour On-Site Industrial SLA',
    services: 'Multi-WAN Failover, POS Synchronization, Structured Cabling',
  },
  {
    id: 'borrowdale-tech',
    name: 'Borrowdale Enterprise Corridor',
    city: 'Borrowdale, Harare North',
    role: 'Corporate HQ & High-Availability Fibre Zone',
    coordinates: { lat: -17.7524, lng: 31.0894 },
    slaWindow: '2-Hour On-Site Corporate SLA',
    services: 'VLAN Segmentation, Cloud ERP Automation, Executive Workstations',
  },
  {
    id: 'bulawayo-hub',
    name: 'Bulawayo Southern Region Dispatch',
    city: 'Bulawayo',
    role: 'Cold-Chain Depot & Regional Failover Hub',
    coordinates: { lat: -20.1325, lng: 28.6265 },
    slaWindow: '24/7 Remote NOC + Partner Field Dispatch',
    services: 'Multi-Branch VPN, Warehouse Stock Sync, Payment Gateways',
  },
  {
    id: 'gweru-hub',
    name: 'Gweru Midlands Telemetry Node',
    city: 'Gweru',
    role: 'Central Corridor Agribusiness & POS Support',
    coordinates: { lat: -19.45, lng: 29.8167 },
    slaWindow: 'Same-Day Remote Engineering + Scheduled Field Ops',
    services: 'USSD & Mobile Money Reconciliation, Fleet Hardware Support',
  },
  {
    id: 'mutare-hub',
    name: 'Mutare Eastern Border Gateway',
    city: 'Mutare',
    role: 'Cross-Border Logistics & Customs IT Support',
    coordinates: { lat: -18.9707, lng: 32.6709 },
    slaWindow: 'Remote NOC + Scheduled Field Dispatch',
    services: 'Fibre Redundancy, Stripe & Paynow Cross-Border Portals',
  },
];

interface MarkerWithInfoProps {
  hub: HubLocation;
  isSelected: boolean;
  onSelect: (hub: HubLocation, marker: google.maps.marker.AdvancedMarkerElement) => void;
}

function HubAdvancedMarker({ hub, isSelected, onSelect }: MarkerWithInfoProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      ref={markerRef}
      position={hub.coordinates}
      title={hub.name}
      zIndex={hub.isHq ? 1000 : isSelected ? 900 : 10}
      onClick={() => {
        if (marker) {
          onSelect(hub, marker);
        }
      }}
    >
      <Pin
        background={hub.isHq ? '#0369a1' : isSelected ? '#0284c7' : '#0f172a'}
        borderColor={hub.isHq ? '#0c4a6e' : '#38bdf8'}
        glyphColor="#ffffff"
      />
    </AdvancedMarker>
  );
}

interface PlaceSearchBoxProps {
  onSelectDestination: (dest: {
    name: string;
    address: string;
    location: google.maps.LatLngLiteral;
  }) => void;
}

function PlaceSearchBox({ onSelectDestination }: PlaceSearchBoxProps) {
  const placesLib = useMapsLibrary('places');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!placesLib || !container) return;

    container.innerHTML = '';
    const autocomplete = new placesLib.PlaceAutocompleteElement({
      includedRegionCodes: ['zw'],
    });
    autocomplete.style.width = '100%';
    container.appendChild(autocomplete);

    const handleSelect = async (event: Event) => {
      const selectEvent = event as google.maps.places.PlacePredictionSelectEvent;
      if (!selectEvent.placePrediction) return;
      try {
        const place = selectEvent.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'viewport'],
        });
        if (place.location) {
          onSelectDestination({
            name: place.displayName || 'Selected Zimbabwe Destination',
            address: place.formattedAddress || 'Zimbabwe',
            location: {
              lat: place.location.lat(),
              lng: place.location.lng(),
            },
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('OVER_QUERY_LIMIT') || msg.includes('Quota')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        console.error('Error fetching selected place fields:', err);
      }
    };

    autocomplete.addEventListener('gmp-select', handleSelect);
    return () => {
      autocomplete.removeEventListener('gmp-select', handleSelect);
      if (container.contains(autocomplete)) {
        container.removeChild(autocomplete);
      }
    };
  }, [placesLib, onSelectDestination]);

  return (
    <div
      ref={containerRef}
      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white overflow-hidden"
    />
  );
}

interface RouteLayerProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral | null;
  onRouteComputed: (summary: {
    distanceText: string;
    durationText: string;
    error?: string;
  } | null) => void;
}

function DispatchRouteLayer({ origin, destination, onRouteComputed }: RouteLayerProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!routesLib || !map || !destination) {
      onRouteComputed(null);
      return;
    }

    let cancelled = false;

    const request: google.maps.routes.ComputeRoutesRequest = {
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
      fields: ['durationMillis', 'distanceMeters', 'localizedValues', 'path', 'viewport'],
    };

    routesLib.Route.computeRoutes(request)
      .then((response) => {
        if (cancelled) return;
        const route = response.routes?.[0];
        if (!route) {
          onRouteComputed({
            distanceText: 'N/A',
            durationText: 'No driving route found',
          });
          return;
        }

        const created = route.createPolylines({
          polylineOptions: {
            strokeColor: '#0369a1',
            strokeOpacity: 0.92,
            strokeWeight: 5,
          },
        });
        created.forEach((line) => line.setMap(map));
        polylinesRef.current = created;

        if (route.viewport) {
          map.fitBounds(route.viewport, 60);
        }

        const distanceKm = route.distanceMeters
          ? `${(route.distanceMeters / 1000).toFixed(1)} km`
          : route.localizedValues?.distance || 'Calculated';
        const mins = route.durationMillis
          ? Math.max(1, Math.round(route.durationMillis / 60000))
          : null;
        const durationText =
          route.localizedValues?.duration ||
          (mins !== null ? `${mins} mins` : 'Available');

        onRouteComputed({
          distanceText: distanceKm,
          durationText,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('OVER_QUERY_LIMIT') || msg.includes('Quota')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        onRouteComputed({
          distanceText: '--',
          durationText: '--',
          error: 'Could not compute driving route for the selected coordinates.',
        });
      });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [routesLib, map, origin, destination, onRouteComputed]);

  return null;
}

export function MapsPage() {
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [keyChecked, setKeyChecked] = useState<boolean>(
    Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
  );
  const [selectedHub, setSelectedHub] = useState<HubLocation>(ESK_ZIMBABWE_HUBS[0]);
  const [activeMarker, setActiveMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  const [customDestination, setCustomDestination] = useState<{
    name: string;
    address: string;
    location: google.maps.LatLngLiteral;
  } | null>(null);
  const [routeSummary, setRouteSummary] = useState<{
    distanceText: string;
    durationText: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (mapsApiKey) return;
    let active = true;
    fetch('/api/config/public')
      .then((res) => (res.ok ? res.json() : { mapsApiKey: '' }))
      .then((data) => {
        if (!active) return;
        if (typeof data?.mapsApiKey === 'string' && data.mapsApiKey) {
          setMapsApiKey(data.mapsApiKey);
        }
        setKeyChecked(true);
      })
      .catch(() => {
        if (active) setKeyChecked(true);
      });
    return () => {
      active = false;
    };
  }, [mapsApiKey]);

  const activeRouteDestination = useMemo(() => {
    if (customDestination) return customDestination.location;
    if (selectedHub && !selectedHub.isHq) return selectedHub.coordinates;
    return null;
  }, [customDestination, selectedHub]);

  const handleSelectPlace = useCallback(
    (dest: {
      name: string;
      address: string;
      location: google.maps.LatLngLiteral;
    }) => {
      setCustomDestination(dest);
      setInfoOpen(false);
    },
    []
  );

  const handleSelectHub = useCallback(
    (hub: HubLocation, marker?: google.maps.marker.AdvancedMarkerElement) => {
      setCustomDestination(null);
      setSelectedHub(hub);
      if (marker) {
        setActiveMarker(marker);
        setInfoOpen(true);
      }
    },
    []
  );

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-700 mb-1">
              Google Maps Platform · Zimbabwe Operations Coverage
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Harare HQ &amp; Regional Dispatch Locator
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-2xl">
              Search any client site across Zimbabwe via Places Autocomplete or select a regional
              corridor node to compute driving dispatch ETAs from Harare HQ.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2 self-start lg:self-auto tabular-nums">
            HQ Coordinates: -17.8252, 31.0335 · Harare, ZW
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!mapsApiKey && keyChecked ? (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-900 font-semibold">
              <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Google Maps JavaScript API Key Not Detected in Current Runtime</span>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">
              Your Google Maps Platform Demo project key was provisioned during setup. Ensure{' '}
              <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">
                VITE_GOOGLE_MAPS_API_KEY
              </code>{' '}
              is available in runtime secrets or restart the preview environment to load interactive
              tiles, Places Autocomplete, and Dispatch Routes.
            </p>
          </div>
        ) : !mapsApiKey ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
            Initializing Google Maps Platform runtime configuration...
          </div>
        ) : (
          <APIProvider
            apiKey={mapsApiKey}
            libraries={['marker', 'places', 'routes']}
            language="en"
            region="ZW"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Sidebar: Places Search, Dispatch ETA & Regional Hubs */}
              <div className="lg:col-span-4 space-y-5">
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-1">
                      <Compass className="w-4 h-4 text-sky-700" aria-hidden="true" />
                      <span>Search Client Site (Zimbabwe)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Powered by Google Places API — select a business address to calculate route
                      distance from Harare HQ.
                    </p>
                  </div>

                  <PlaceSearchBox onSelectDestination={handleSelectPlace} />

                  {customDestination && (
                    <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-lg space-y-1">
                      <div className="text-xs font-semibold text-sky-800">
                        Custom Dispatch Target
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {customDestination.name}
                      </div>
                      <div className="text-xs text-slate-600">{customDestination.address}</div>
                      <button
                        type="button"
                        onClick={() => setCustomDestination(null)}
                        className="mt-1 text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
                      >
                        Clear Custom Target
                      </button>
                    </div>
                  )}

                  {routeSummary && (
                    <div className="p-4 bg-slate-900 text-white rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                        <RouteIcon className="w-4 h-4" aria-hidden="true" />
                        <span>Live Driving Dispatch Route</span>
                      </div>
                      {routeSummary.error ? (
                        <p className="text-xs text-amber-300">{routeSummary.error}</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <div className="text-[11px] text-slate-400">Road Distance</div>
                            <div className="font-mono text-base font-bold tabular-nums">
                              {routeSummary.distanceText}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-400">Estimated Drive</div>
                            <div className="font-mono text-base font-bold tabular-nums">
                              {routeSummary.durationText}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Regional Service Hubs List */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="text-sm font-semibold text-slate-900">
                    ESK Operations Nodes ({ESK_ZIMBABWE_HUBS.length})
                  </div>
                  <div className="space-y-2">
                    {ESK_ZIMBABWE_HUBS.map((hub) => {
                      const active = !customDestination && selectedHub.id === hub.id;
                      return (
                        <button
                          key={hub.id}
                          type="button"
                          onClick={() => handleSelectHub(hub)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                            active
                              ? 'bg-sky-50 border-sky-600'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {hub.city}
                            </span>
                            <span className="text-[11px] font-mono font-medium text-sky-700">
                              {hub.isHq ? 'HQ' : 'Route'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">{hub.role}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Map Container with explicit dimensions */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="h-[520px] lg:h-[620px] w-full">
                    <GoogleMap
                      mapId="DEMO_MAP_ID"
                      defaultCenter={HARARE_HQ}
                      defaultZoom={11}
                      gestureHandling="greedy"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      className="w-full h-full"
                    >
                      {ESK_ZIMBABWE_HUBS.map((hub) => (
                        <HubAdvancedMarker
                          key={hub.id}
                          hub={hub}
                          isSelected={!customDestination && selectedHub.id === hub.id}
                          onSelect={handleSelectHub}
                        />
                      ))}

                      {customDestination && (
                        <AdvancedMarker
                          position={customDestination.location}
                          title={customDestination.name}
                          zIndex={950}
                        >
                          <Pin
                            background="#059669"
                            borderColor="#065f46"
                            glyphColor="#ffffff"
                          />
                        </AdvancedMarker>
                      )}

                      {infoOpen && activeMarker && (
                        <InfoWindow
                          anchor={activeMarker}
                          pixelOffset={[0, -4]}
                          onCloseClick={() => setInfoOpen(false)}
                        >
                          <div className="p-1 max-w-[240px] space-y-1.5">
                            <div className="text-xs font-semibold text-sky-700">
                              {selectedHub.city}
                            </div>
                            <div className="text-sm font-bold text-slate-900">
                              {selectedHub.name}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {selectedHub.services}
                            </p>
                            <div className="text-[11px] font-mono text-slate-500">
                              {selectedHub.slaWindow}
                            </div>
                          </div>
                        </InfoWindow>
                      )}

                      <DispatchRouteLayer
                        origin={HARARE_HQ}
                        destination={activeRouteDestination}
                        onRouteComputed={setRouteSummary}
                      />
                    </GoogleMap>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {customDestination ? customDestination.name : selectedHub.name}
                      </div>
                      <div className="text-xs text-slate-600">
                        {customDestination ? customDestination.address : selectedHub.services}
                      </div>
                    </div>
                  </div>
                  <a
                    href={COMPANY_INFO.phoneHref}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Dispatch: {COMPANY_INFO.phoneDisplay}</span>
                  </a>
                </div>
              </div>
            </div>
          </APIProvider>
        )}
      </section>
    </div>
  );
}
