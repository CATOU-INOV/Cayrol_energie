// Carte interactive des réalisations Cayrol Energie (Leaflet, sans clé API).
// Composant prioritaire de la démo : îlot React hydraté côté client (client:only, Leaflet a besoin de `window`).
// Points colorés par filière énergétique, cliquables, filtrables par type.

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import projectsData from "../data/projects.json";

interface Project {
  id: string;
  name: string;
  commune: string;
  lat: number;
  lng: number;
  type: string;
  energy: string;
  power: string;
  description: string;
}

const projects = projectsData as Project[];

// Couleur de marqueur par filière — s'appuie sur la même charte que le reste du site.
const ENERGY_COLORS: Record<string, string> = {
  photovoltaique: "#f97316",
  hydroelectricite: "#1d4ed8",
  "flexibilite-bess": "#dc2626",
  biogaz: "#16a34a",
  hybride: "#7c3aed",
};

const ENERGY_LABELS: Record<string, string> = {
  photovoltaique: "Photovoltaïque",
  hydroelectricite: "Hydroélectricité",
  "flexibilite-bess": "Flexibilité / BESS",
  biogaz: "Biogaz",
  hybride: "Hydroélectricité + Photovoltaïque",
};

export default function ProjectMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("tous");

  const energyTypes = useMemo(
    () => Array.from(new Set(projects.map((p) => p.energy))),
    []
  );

  const filteredProjects = useMemo(
    () => (activeFilter === "tous" ? projects : projects.filter((p) => p.energy === activeFilter)),
    [activeFilter]
  );

  // Initialisation de la carte (une seule fois).
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false, // évite de capturer le scroll de la page quand on survole la carte
        zoomSnap: 0.5,
      }).setView([45.5, 4.5], 6);
      mapRef.current = map;

      // Fond de carte clair et épuré (CartoDB Positron) : plus élégant que les tuiles OSM par
      // défaut, et fait ressortir les points colorés par filière — pas de clé API requise.
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      renderMarkers(L, map);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-rendu des marqueurs quand le filtre change.
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      if (mapRef.current) renderMarkers(L, mapRef.current);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  function renderMarkers(L: typeof import("leaflet"), map: LeafletMap) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds: [number, number][] = [];

    filteredProjects.forEach((project) => {
      const color = ENERGY_COLORS[project.energy] ?? "#6b7280";
      const icon = L.divIcon({
        className: "",
        html: `<span style="
          display:block;width:18px;height:18px;border-radius:9999px;
          background:${color};border:3px solid white;
          box-shadow:0 1px 4px rgba(0,0,0,0.4);
        "></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([project.lat, project.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="min-width:180px">
          <p style="margin:0 0 4px;font-weight:700;color:${color}">${project.name}</p>
          <p style="margin:0 0 2px;font-size:12px;color:#525252">${project.commune}</p>
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;">${project.type} — ${project.power}</p>
          <p style="margin:0;font-size:12px;color:#404040">${project.description}</p>
        </div>
      `);

      markersRef.current.push(marker);
      bounds.push([project.lat, project.lng]);
    });

    if (bounds.length === 1) {
      // Un seul point (ou tous confondus) : fitBounds zoomerait au niveau rue sur un cadre vide.
      // Zoom fixe "régional" pour garder du contexte géographique autour du marqueur.
      map.setView(bounds[0], 9);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 9 });
    }
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterButton
          label="Tous les projets"
          active={activeFilter === "tous"}
          color="#404040"
          onClick={() => setActiveFilter("tous")}
        />
        {energyTypes.map((energy) => (
          <FilterButton
            key={energy}
            label={ENERGY_LABELS[energy] ?? energy}
            active={activeFilter === energy}
            color={ENERGY_COLORS[energy] ?? "#6b7280"}
            onClick={() => setActiveFilter(energy)}
          />
        ))}
      </div>
      <div
        ref={containerRef}
        className="h-[320px] w-full overflow-hidden rounded-2xl border border-black/5 shadow-md md:h-[400px]"
      />
      <p className="mt-2 text-xs text-neutral-500">
        {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""} affiché
        {filteredProjects.length > 1 ? "s" : ""} — cliquez sur un point pour le détail.
      </p>
    </div>
  );
}

function FilterButton({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-xs font-medium transition md:text-sm"
      style={
        active
          ? { backgroundColor: color, borderColor: color, color: "white" }
          : { backgroundColor: "white", borderColor: `${color}55`, color }
      }
    >
      {label}
    </button>
  );
}
