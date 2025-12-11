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
}


// -------------------------------------------------
// FIXED MapPickerDialog
// -------------------------------------------------
export const MapPickerDialog: FC<MapPickerProps> = ({
    open,
    onClose,
    onSelect,
}) => {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<[number, number] | null>(null);

    // FIX 3 — prevent leaflet rendering during hydration
    useEffect(() => {
        setMounted(true);
        configureLeafletIcons();
    }, []);

    const defaultCenter: LatLngExpression = [23.8103, 90.4125];

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
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <DialogHeader className="px-4 py-3 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-emerald-500" />
                        Pick a Location
                    </DialogTitle>
                </DialogHeader>

                <div className="h-[500px] w-full">
                    {/* FIX: Prevent map from rendering before mount */}
                    {mounted && open && (
                        <MapContainer
                            center={defaultCenter}
                            zoom={5}
                            scrollWheelZoom
                            className="h-full w-full"
                        >
                            <ForceResize open={open} />

                            <TileLayer
                                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="© OpenStreetMap contributors"
                            />

                            <ClickHandler />

                            {position && <Marker position={position} />}
                        </MapContainer>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};