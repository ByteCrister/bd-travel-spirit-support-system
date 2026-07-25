// src/components/settings/settings/footer/MapPickerDialog.tsx
"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, FC, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Search, X, Navigation, Check, Loader2 } from "lucide-react";
import { useMap, useMapEvents } from "react-leaflet";
import { LatLngExpression, LeafletMouseEvent } from "leaflet";

// ── Dynamic imports (SSR-safe) ────────────────────────────────
const MapContainer = dynamic(
    () => import("react-leaflet").then((m) => m.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((m) => m.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((m) => m.Marker),
    { ssr: false }
);

// ── Leaflet icon fix ─────────────────────────────────────────
let L: typeof import("leaflet") | null = null;
async function configureLeafletIcons() {
    if (!L) L = (await import("leaflet")).default;
    const flag = "_configured";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((L.Icon.Default as any)[flag]) return;
    L.Icon.Default.mergeOptions({
        iconUrl: "/leaflet/marker-icon.png",
        iconRetinaUrl: "/leaflet/marker-icon.png",
        shadowUrl: "",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L.Icon.Default as any)[flag] = true;
}

// ── Nominatim result type ─────────────────────────────────────
interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

// ── Sub-components ────────────────────────────────────────────
const ForceResize: FC<{ open: boolean }> = ({ open }) => {
    const map = useMap();
    useEffect(() => {
        if (!open) return;
        const timeouts = [
            setTimeout(() => map.invalidateSize(), 50),
            setTimeout(() => map.invalidateSize(), 150),
            setTimeout(() => map.invalidateSize(), 300),
        ];
        return () => timeouts.forEach(clearTimeout);
    }, [open, map]);
    return null;
};

const FlyToPosition: FC<{ position: [number, number] | null }> = ({ position }) => {
    const map = useMap();
    const prevRef = useRef<[number, number] | null>(null);
    useEffect(() => {
        if (!position) return;
        if (
            prevRef.current &&
            prevRef.current[0] === position[0] &&
            prevRef.current[1] === position[1]
        )
            return;
        prevRef.current = position;
        map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.8 });
    }, [position, map]);
    return null;
};

const ClickHandler: FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
    useMapEvents({
        click: (e: LeafletMouseEvent) => {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// ── Public props (unchanged from original) ────────────────────
export interface MapPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (lat: number, lng: number) => void;
    initialPosition?: [number, number];
}

// ── Helper ────────────────────────────────────────────────────
function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}
function isValidLat(v: number) {
    return !isNaN(v) && v >= -90 && v <= 90;
}
function isValidLng(v: number) {
    return !isNaN(v) && v >= -180 && v <= 180;
}

// ── Main component ────────────────────────────────────────────
export const MapPickerDialog: FC<MapPickerProps> = ({
    open,
    onClose,
    onSelect,
    initialPosition,
}) => {
    const [mounted, setMounted] = useState(false);

    // Selected pin position
    const [position, setPosition] = useState<[number, number] | null>(
        initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0
            ? initialPosition
            : null
    );

    // Lat/Lng text inputs (controlled separately so user can type freely)
    const [latInput, setLatInput] = useState("");
    const [lngInput, setLngInput] = useState("");
    const [inputError, setInputError] = useState("");

    // Search
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Fly trigger
    const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

    // ── Sync position → inputs ───────────────────────────────
    useEffect(() => {
        if (position) {
            setLatInput(position[0].toFixed(6));
            setLngInput(position[1].toFixed(6));
            setInputError("");
        }
    }, [position]);

    // ── Sync initialPosition prop ────────────────────────────
    useEffect(() => {
        if (initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0) {
            setPosition(initialPosition);
            setFlyTarget(initialPosition);
        }
    }, [initialPosition]);

    useEffect(() => {
        setMounted(true);
        configureLeafletIcons();
    }, []);

    // ── Close suggestions on outside click ──────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Nominatim search (debounced) ─────────────────────────
    const handleSearchInput = useCallback((value: string) => {
        setQuery(value);
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        if (!value.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        searchDebounce.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(value)}`,
                    { headers: { "Accept-Language": "en" } }
                );
                const data: NominatimResult[] = await res.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
            } finally {
                setSearching(false);
            }
        }, 450);
    }, []);

    const selectSuggestion = useCallback((result: NominatimResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setPosition([lat, lng]);
        setFlyTarget([lat, lng]);
        setQuery(result.display_name.split(",").slice(0, 3).join(","));
        setSuggestions([]);
        setShowSuggestions(false);
    }, []);

    // ── Map click handler ────────────────────────────────────
    const handleMapPick = useCallback((lat: number, lng: number) => {
        setPosition([lat, lng]);
        // don't fly — user already clicked there
    }, []);

    // ── Manual lat/lng apply ─────────────────────────────────
    const applyManualCoords = useCallback(() => {
        const lat = parseFloat(latInput);
        const lng = parseFloat(lngInput);
        if (!isValidLat(lat)) {
            setInputError("Latitude must be between −90 and 90");
            return;
        }
        if (!isValidLng(lng)) {
            setInputError("Longitude must be between −180 and 180");
            return;
        }
        setInputError("");
        const clamped: [number, number] = [clamp(lat, -90, 90), clamp(lng, -180, 180)];
        setPosition(clamped);
        setFlyTarget(clamped);
    }, [latInput, lngInput]);

    // ── Confirm selection ────────────────────────────────────
    const handleConfirm = useCallback(() => {
        if (!position) return;
        onSelect(position[0], position[1]);
        onClose();
    }, [position, onSelect, onClose]);

    // ── Use my location ──────────────────────────────────────
    const handleGeolocate = useCallback(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setPosition([lat, lng]);
            setFlyTarget([lat, lng]);
        });
    }, []);

    const defaultCenter: LatLngExpression =
        initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0
            ? initialPosition
            : [23.8103, 90.4125];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                className="p-0 border-0 shadow-none bg-transparent"
                style={{
                    maxWidth: "900px",
                    width: "95vw",
                    maxHeight: "92vh",
                    borderRadius: 0,
                    overflow: "visible",
                }}
            >
                <span className="sr-only">
                    <DialogTitle>Pick a Location</DialogTitle>
                </span>
                {/* ── Outer shell ── */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "86vh",
                        maxHeight: "86vh",
                        borderRadius: "20px",
                        overflow: "hidden",
                        boxShadow: "0 24px 60px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.16)",
                        background: "#1a1d21",
                        fontFamily: "system-ui, sans-serif",
                        position: "relative",
                    }}
                >
                    {/* ── Map (full area) ── */}
                    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                        {mounted && open && (
                            <MapContainer
                                center={defaultCenter}
                                zoom={position ? 14 : 6}
                                scrollWheelZoom
                                zoomControl={false}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <ForceResize open={open} />
                                <FlyToPosition position={flyTarget} />
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                                    maxZoom={20}
                                />
                                <ClickHandler onPick={handleMapPick} />
                                {position && <Marker position={position} />}
                            </MapContainer>
                        )}

                        {/* ── Google Maps-style search bar (overlay) ── */}
                        <div
                            ref={searchRef}
                            style={{
                                position: "absolute",
                                top: 16,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "min(480px, calc(100% - 32px))",
                                zIndex: 1000,
                            }}
                        >
                            {/* Search input row */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "#fff",
                                    borderRadius: showSuggestions && suggestions.length > 0 ? "12px 12px 0 0" : "12px",
                                    boxShadow: "0 2px 16px rgba(0,0,0,0.22)",
                                    padding: "0 14px",
                                    gap: 8,
                                    height: 48,
                                }}
                            >
                                {searching ? (
                                    <Loader2
                                        size={18}
                                        style={{ color: "#006666", flexShrink: 0, animation: "spin 1s linear infinite" }}
                                    />
                                ) : (
                                    <Search size={18} style={{ color: "#5f6368", flexShrink: 0 }} />
                                )}
                                <input
                                    type="text"
                                    placeholder="Search location…"
                                    value={query}
                                    onChange={(e) => handleSearchInput(e.target.value)}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && suggestions.length > 0) {
                                            selectSuggestion(suggestions[0]);
                                        }
                                        if (e.key === "Escape") setShowSuggestions(false);
                                    }}
                                    style={{
                                        flex: 1,
                                        border: "none",
                                        outline: "none",
                                        fontSize: 15,
                                        color: "#1a1a1a",
                                        background: "transparent",
                                    }}
                                />
                                {query && (
                                    <button
                                        onClick={() => {
                                            setQuery("");
                                            setSuggestions([]);
                                            setShowSuggestions(false);
                                        }}
                                        style={{
                                            border: "none",
                                            background: "none",
                                            cursor: "pointer",
                                            padding: 4,
                                            display: "flex",
                                            borderRadius: "50%",
                                        }}
                                    >
                                        <X size={16} style={{ color: "#5f6368" }} />
                                    </button>
                                )}
                            </div>

                            {/* Suggestions dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div
                                    style={{
                                        background: "#fff",
                                        borderRadius: "0 0 12px 12px",
                                        boxShadow: "0 8px 20px rgba(0,0,0,0.20)",
                                        overflow: "hidden",
                                        borderTop: "1px solid #e8eaed",
                                    }}
                                >
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={s.place_id}
                                            onClick={() => selectSuggestion(s)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 12,
                                                width: "100%",
                                                padding: "11px 14px",
                                                border: "none",
                                                background: "transparent",
                                                cursor: "pointer",
                                                textAlign: "left",
                                                borderBottom: i < suggestions.length - 1 ? "1px solid #f1f3f4" : "none",
                                                transition: "background 0.12s",
                                            }}
                                            onMouseEnter={(e) =>
                                                ((e.currentTarget as HTMLButtonElement).style.background = "#f8f9fa")
                                            }
                                            onMouseLeave={(e) =>
                                                ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
                                            }
                                        >
                                            <MapPin
                                                size={16}
                                                style={{ color: "#006666", flexShrink: 0, marginTop: 1 }}
                                            />
                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    color: "#3c4043",
                                                    lineHeight: 1.4,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {s.display_name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── My Location button (top-right) ── */}
                        <button
                            onClick={handleGeolocate}
                            title="Use my location"
                            style={{
                                position: "absolute",
                                top: 16,
                                right: 16,
                                zIndex: 1000,
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                border: "none",
                                background: "#fff",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLButtonElement).style.background = "#f0f4f8")
                            }
                            onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLButtonElement).style.background = "#fff")
                            }
                        >
                            <Navigation size={18} style={{ color: "#006666" }} />
                        </button>

                        {/* ── Click hint pill ── */}
                        {!position && (
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 16,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    zIndex: 999,
                                    background: "rgba(0,0,0,0.65)",
                                    color: "#fff",
                                    padding: "7px 16px",
                                    borderRadius: 20,
                                    fontSize: 13,
                                    pointerEvents: "none",
                                    backdropFilter: "blur(4px)",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Click on the map or search to pin a location
                            </div>
                        )}
                    </div>

                    {/* ── Bottom panel ── */}
                    <div
                        style={{
                            background: "#1a1d21",
                            padding: "16px 20px",
                            borderTop: "1px solid rgba(255,255,255,0.08)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}
                    >
                        {/* Header row */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <MapPin size={16} style={{ color: "#00b5b5" }} />
                            <span
                                style={{
                                    color: "#e0e0e0",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    letterSpacing: 0.3,
                                }}
                            >
                                {position ? "Selected Location" : "No location selected"}
                            </span>
                        </div>

                        {/* Lat / Lng inputs + Confirm */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 10,
                                flexWrap: "wrap",
                            }}
                        >
                            {/* Lat */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 140px" }}>
                                <label
                                    style={{ color: "#8a8d91", fontSize: 11, fontWeight: 500, letterSpacing: 0.5 }}
                                >
                                    LATITUDE
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    min={-90}
                                    max={90}
                                    value={latInput}
                                    onChange={(e) => {
                                        setLatInput(e.target.value);
                                        setInputError("");
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && applyManualCoords()}
                                    placeholder="e.g. 23.8103"
                                    style={{
                                        background: "#2a2d33",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: 8,
                                        color: "#e8e8e8",
                                        fontSize: 14,
                                        padding: "8px 12px",
                                        outline: "none",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        width: "100%",
                                    }}
                                    onFocus={(e) =>
                                        (e.currentTarget.style.borderColor = "#006666")
                                    }
                                    onBlur={(e) =>
                                        (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
                                    }
                                />
                            </div>

                            {/* Lng */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 140px" }}>
                                <label
                                    style={{ color: "#8a8d91", fontSize: 11, fontWeight: 500, letterSpacing: 0.5 }}
                                >
                                    LONGITUDE
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    min={-180}
                                    max={180}
                                    value={lngInput}
                                    onChange={(e) => {
                                        setLngInput(e.target.value);
                                        setInputError("");
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && applyManualCoords()}
                                    placeholder="e.g. 90.4125"
                                    style={{
                                        background: "#2a2d33",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: 8,
                                        color: "#e8e8e8",
                                        fontSize: 14,
                                        padding: "8px 12px",
                                        outline: "none",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        width: "100%",
                                    }}
                                    onFocus={(e) =>
                                        (e.currentTarget.style.borderColor = "#006666")
                                    }
                                    onBlur={(e) =>
                                        (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
                                    }
                                />
                            </div>

                            {/* Apply coords button */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                                <label style={{ color: "transparent", fontSize: 11 }}>GO</label>
                                <button
                                    onClick={applyManualCoords}
                                    title="Go to coordinates"
                                    style={{
                                        height: 37,
                                        padding: "0 14px",
                                        background: "rgba(0,102,102,0.2)",
                                        border: "1px solid rgba(0,181,181,0.3)",
                                        borderRadius: 8,
                                        color: "#00b5b5",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                        transition: "all 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.background =
                                            "rgba(0,102,102,0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.background =
                                            "rgba(0,102,102,0.2)";
                                    }}
                                >
                                    Go
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {inputError && (
                            <p style={{ color: "#ff7373", fontSize: 12, margin: 0 }}>{inputError}</p>
                        )}

                        {/* Action buttons row */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 10,
                                paddingTop: 2,
                            }}
                        >
                            <button
                                onClick={onClose}
                                style={{
                                    padding: "9px 20px",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: 10,
                                    background: "transparent",
                                    color: "#9aa0a6",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background =
                                        "rgba(255,255,255,0.06)";
                                    (e.currentTarget as HTMLButtonElement).style.color = "#e0e0e0";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                    (e.currentTarget as HTMLButtonElement).style.color = "#9aa0a6";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!position}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "9px 22px",
                                    border: "none",
                                    borderRadius: 10,
                                    background: position
                                        ? "linear-gradient(135deg, #006666 0%, #009999 100%)"
                                        : "rgba(255,255,255,0.08)",
                                    color: position ? "#fff" : "#555",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: position ? "pointer" : "not-allowed",
                                    boxShadow: position ? "0 4px 14px rgba(0,150,150,0.35)" : "none",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    if (!position) return;
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                        "0 6px 20px rgba(0,150,150,0.5)";
                                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(e) => {
                                    if (!position) return;
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                        "0 4px 14px rgba(0,150,150,0.35)";
                                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                }}
                            >
                                <Check size={15} />
                                Confirm Location
                            </button>
                        </div>
                    </div>
                </div>

                {/* Spinner keyframes */}
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </DialogContent>
        </Dialog>
    );
};