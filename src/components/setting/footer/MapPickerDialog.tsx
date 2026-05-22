// src/components/settings/settings/footer/MapPickerDialog.tsx
"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { useMap, useMapEvents } from "react-leaflet";
import { LatLngExpression, LeafletMouseEvent } from "leaflet";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_DIALOG_CONTENT =
    "max-w-3xl overflow-hidden rounded-2xl p-0 border border-white/60 " +
    "bg-[#E7E5E4] shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff] " +
    "max-h-[90vh] flex flex-col";

const NEU_DIALOG_HEADER =
    "border-b border-white/40 bg-[#E7E5E4] px-5 py-4";

const NEU_TITLE =
    "flex items-center gap-2 font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-base";

const NEU_FOOTER =
    "border-t border-white/40 bg-[#E7E5E4] px-5 py-3 " +
    "shadow-[0_-2px_6px_#c8c6c5]";

const NEU_COORDS_TEXT =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60";

const NEU_BTN_CANCEL =
    "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/70 bg-[#E7E5E4] " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
// ─────────────────────────────────────────────────────────────

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

const CenterMap: FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] !== 0 && center[1] !== 0) {
            map.setView(center, 12);
        }
    }, [center, map]);
    return null;
};

let L: typeof import("leaflet") | null = null;
async function configureLeafletIcons() {
    if (!L) L = (await import("leaflet")).default;
    const flag = "_configured";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((L.Icon.Default as any)[flag]) return;
    L.Icon.Default.mergeOptions({
        iconUrl: "/leaflet/marker-icon.png",
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        shadowUrl: "/leaflet/marker-shadow.png",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L.Icon.Default as any)[flag] = true;
}

export interface MapPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (lat: number, lng: number) => void;
    initialPosition?: [number, number];
}

export const MapPickerDialog: FC<MapPickerProps> = ({
    open,
    onClose,
    onSelect,
    initialPosition,
}) => {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<[number, number] | null>(
        initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0
            ? initialPosition
            : null
    );

    useEffect(() => {
        if (initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0) {
            setPosition(initialPosition);
        }
    }, [initialPosition]);

    useEffect(() => {
        setMounted(true);
        configureLeafletIcons();
    }, []);

    const defaultCenter: LatLngExpression =
        initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0
            ? initialPosition
            : [23.8103, 90.4125];

    const ClickHandler: FC = () => {
        useMapEvents({
            click: (e: LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                onSelect(lat, lng);
                onClose();
            },
        });
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className={NEU_DIALOG_CONTENT}>
                <DialogHeader className={NEU_DIALOG_HEADER}>
                    <DialogTitle className={NEU_TITLE}>
                        <MapPin className="h-4 w-4 text-[#006666]" />
                        {position ? "Update Location on Map" : "Pick a Location"}
                    </DialogTitle>
                    {position && (
                        <p className="mt-1 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                            Click anywhere on the map to update the location
                        </p>
                    )}
                </DialogHeader>

                <div className="h-[480px] w-full">
                    {mounted && open && (
                        <MapContainer
                            center={defaultCenter}
                            zoom={position ? 12 : 5}
                            scrollWheelZoom
                            className="h-full w-full"
                        >
                            <ForceResize open={open} />
                            {position && <CenterMap center={position} />}
                            <TileLayer
                                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="© OpenStreetMap contributors"
                            />
                            <ClickHandler />
                            {position && <Marker position={position} />}
                        </MapContainer>
                    )}
                </div>

                <div className={NEU_FOOTER}>
                    <div className="flex items-center justify-between gap-4">
                        <p className={NEU_COORDS_TEXT}>
                            {position ? (
                                <>
                                    Selected:{" "}
                                    <span className="font-bold text-[#006666]">
                                        {position[0].toFixed(6)}, {position[1].toFixed(6)}
                                    </span>
                                </>
                            ) : (
                                "Click on the map to select a location"
                            )}
                        </p>
                        <button type="button" className={NEU_BTN_CANCEL} onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};