// src/components/settings/settings/footer/MapPickerDialog.tsx
"use client";

import "leaflet/dist/leaflet.css";
import { useState, useEffect, FC } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";

import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from "react-leaflet";

import L, { LatLngExpression, LeafletMouseEvent } from "leaflet";
import { Button } from "@/components/ui/button";


// -------------------------------------------------
// FIX 1 — Robust resize after dialog opens
// -------------------------------------------------
const ForceResize: FC<{ open: boolean }> = ({ open }) => {
    const map = useMap();

    useEffect(() => {
        if (!open) return;

        // Run multiple invalidations during animation
        const timeouts = [
            setTimeout(() => map.invalidateSize(), 50),
            setTimeout(() => map.invalidateSize(), 150),
            setTimeout(() => map.invalidateSize(), 300),
        ];

        return () => timeouts.forEach(clearTimeout);
    }, [open, map]);

    return null;
};


// -------------------------------------------------
// Center Map to Position
// -------------------------------------------------
const CenterMap: FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center && center[0] !== 0 && center[1] !== 0) {
            map.setView(center, 12); // Zoom to 12 for better view of specific location
        }
    }, [center, map]);

    return null;
};


// -------------------------------------------------
// FIX 2 — Configure Leaflet Icons (same as before)
// -------------------------------------------------
function configureLeafletIcons(): void {
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


// -------------------------------------------------
// Props
// -------------------------------------------------
export interface MapPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (lat: number, lng: number) => void;
    initialPosition?: [number, number]; // Add this prop
}


// -------------------------------------------------
// FIXED MapPickerDialog
// -------------------------------------------------
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

    // Reset position when initialPosition changes (for editing mode)
    useEffect(() => {
        if (initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0) {
            setPosition(initialPosition);
        }
    }, [initialPosition]);

    // FIX 3 — prevent leaflet rendering during hydration
    useEffect(() => {
        setMounted(true);
        configureLeafletIcons();
    }, []);

    // Determine default center: use initialPosition if valid, otherwise use default
    const defaultCenter: LatLngExpression =
        initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0
            ? initialPosition
            : [23.8103, 90.4125]; // Bangladesh coordinates as fallback

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
            <DialogContent className="
            max-w-3xl
            p-0
            overflow-hidden
            max-h-[90vh]
            flex
            flex-col
            ">
                <DialogHeader className="px-4 py-3 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-emerald-500" />
                        {position ? "Update Location on Map" : "Pick a Location"}
                    </DialogTitle>
                    {position && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Click anywhere on the map to update the location
                        </p>
                    )}
                </DialogHeader>

                <div className="h-[500px] w-full">
                    {/* FIX: Prevent map from rendering before mount */}
                    {mounted && open && (
                        <MapContainer
                            center={defaultCenter}
                            zoom={position ? 12 : 5} // Zoom in more if we have an existing position
                            scrollWheelZoom
                            className="h-full w-full"
                        >
                            <ForceResize open={open} />

                            {/* Center map to initial position */}
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

                <div className="px-4 py-3 border-t bg-slate-50 dark:bg-slate-800">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                            {position ? (
                                <>
                                    Current selection:{" "}
                                    <span className="font-semibold">
                                        {position[0].toFixed(6)}, {position[1].toFixed(6)}
                                    </span>
                                </>
                            ) : (
                                "Click on the map to select a location"
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};