export type Belt =
  | "White"
  | "Yellow"
  | "Orange"
  | "Green"
  | "Blue"
  | "Purple"
  | "Brown"
  | "Red"
  | "Black"
  | "Unranked";

export type LockRecord = {
  id: string;
  name: string;
  version?: string;
  mechanisms: string[];
  belt: Belt;
  beltLevel?: `Black ${1 | 2 | 3 | 4 | 5}`;
  status: "Owned" | "Wishlist";
  picked: boolean;
  resourceLinks?: {
    lpu?: string;
  };
};

export const profileSnapshotDate = "September 8, 2026 · 3:11 PM EDT";

export const beltOrder: Belt[] = [
  "White",
  "Yellow",
  "Orange",
  "Green",
  "Blue",
  "Purple",
  "Brown",
  "Red",
  "Black",
  "Unranked",
];

export const beltColors: Record<Belt, string> = {
  White: "#f4f6fa",
  Yellow: "#f4db32",
  Orange: "#ff8a34",
  Green: "#34a853",
  Blue: "#3b82f6",
  Purple: "#a855f7",
  Brown: "#7b4729",
  Red: "#ef4444",
  Black: "#080a0f",
  Unranked: "#566171",
};

export const profileBeltCounts: Record<Belt, number> = {
  White: 3,
  Yellow: 5,
  Orange: 8,
  Green: 16,
  Blue: 35,
  Purple: 24,
  Brown: 14,
  Red: 12,
  Black: 29,
  Unranked: 1,
};

export const statusBenchmarks = [
  { label: "Owned", user: 78, average: 14, topTen: 250 },
  { label: "Picked", user: 11, average: 11, topTen: 280 },
  { label: "Recorded", user: 0, average: 11, topTen: 260 },
  { label: "Wishlist", user: 69, average: 8, topTen: 100 },
];

export const progression = [
  { belt: "Yellow" as Belt, date: "2024-09-02" },
  { belt: "Orange" as Belt, date: "2024-09-27" },
  { belt: "Green" as Belt, date: "2025-05-18" },
  { belt: "Blue" as Belt, date: "2025-05-19" },
];

const lockCatalog: Omit<LockRecord, "status" | "picked">[] = [
  {
    "id": "07034c0f",
    "name": "Any Acrylic Padlock",
    "mechanisms": [
      "Various"
    ],
    "belt": "White",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/07034c0f.html"
    }
  },
  {
    "id": "901b35b2",
    "name": "Any Cutaway Lock",
    "mechanisms": [
      "Various"
    ],
    "belt": "White",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/901b35b2.html"
    }
  },
  {
    "id": "562e964e",
    "name": "Master Lock #3",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "White",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/562e964e.html"
    }
  },
  {
    "id": "d974b48f",
    "name": "Brinks 164 padlock",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Yellow",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/d974b48f.html"
    }
  },
  {
    "id": "58307da0",
    "name": "Brinks Brass Padlocks",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Yellow",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/58307da0.html"
    }
  },
  {
    "id": "2455f0ae",
    "name": "Master Lock 140 Series / Master Lock 9140 EURD",
    "version": "Ex: 140, 141, 142, etc.",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Yellow",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/2455f0ae.html"
    }
  },
  {
    "id": "40f7d7c7",
    "name": "Schlage Original Commercial/Residential",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Yellow",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/40f7d7c7.html"
    }
  },
  {
    "id": "a460c971",
    "name": "Squire 440",
    "version": "4 lever, pin key",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Yellow",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/a460c971.html"
    }
  },
  {
    "id": "632f4069",
    "name": "ABUS 55/40",
    "version": "40mm or larger",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Orange",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/632f4069.html"
    }
  },
  {
    "id": "bf8970de",
    "name": "ACE Tubular",
    "mechanisms": [
      "Pump/push"
    ],
    "belt": "Orange",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/bf8970de.html"
    }
  },
  {
    "id": "171f76e9",
    "name": "Burg Wächter Boccia",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Orange",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/171f76e9.html"
    }
  },
  {
    "id": "efc01233",
    "name": "Master Lock 150 / Master Lock 160 / Master Lock 9150 EURD",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Orange",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/efc01233.html"
    }
  },
  {
    "id": "8d67f9b7",
    "name": "Master Lock 1921D \"100 Anniversary\" Padlock",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Orange",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/8d67f9b7.html"
    }
  },
  {
    "id": "9ca2c109",
    "name": "Master Lock 570 / Master Lock 575 / Master Lock 576",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Orange",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/9ca2c109.html"
    }
  },
  {
    "id": "ea1d1d8c",
    "name": "Schlage Everest",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Orange",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/ea1d1d8c.html"
    }
  },
  {
    "id": "222bd1fa",
    "name": "Yale 112",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Orange",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/222bd1fa.html"
    }
  },
  {
    "id": "74a00ae3",
    "name": "ABUS 72/40 / ABUS 34CS55 Platinum",
    "version": "Guttable version",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/74a00ae3.html"
    }
  },
  {
    "id": "e1625c4d",
    "name": "ABUS 80TI Titalium",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/e1625c4d.html"
    }
  },
  {
    "id": "2484ce70",
    "name": "ABUS EC 75/30 / ABUS 34/55 Strada",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/2484ce70.html"
    }
  },
  {
    "id": "13b06cba",
    "name": "ABUS GDS",
    "version": "with trees and tapered pins",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/13b06cba.html"
    }
  },
  {
    "id": "2ae1e0b8",
    "name": "American Lock 1100 / A1100",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/2ae1e0b8.html"
    }
  },
  {
    "id": "1ae40987",
    "name": "American Lock 1160",
    "version": "1100 but with 6 pin stacks",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/1ae40987.html"
    }
  },
  {
    "id": "5a6170fb",
    "name": "American Lock S1100",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/5a6170fb.html"
    }
  },
  {
    "id": "0b82681f",
    "name": "ASSA 500 / Ruko 500",
    "version": "tapered drivers",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/0b82681f.html"
    }
  },
  {
    "id": "e957e0d6",
    "name": "Brady SafeKey",
    "mechanisms": [
      "Pump/push"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/e957e0d6.html"
    }
  },
  {
    "id": "73a718cb",
    "name": "Corbin Russwin Master Ring",
    "version": "**",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/73a718cb.html"
    }
  },
  {
    "id": "cd0c2ff9",
    "name": "FAB 200RS",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/cd0c2ff9.html"
    }
  },
  {
    "id": "639c4f0b",
    "name": "FJM Padlock",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/639c4f0b.html"
    }
  },
  {
    "id": "c942490e",
    "name": "Master Lock 410 LOTO (Lockout Tagout)",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/c942490e.html"
    }
  },
  {
    "id": "366d5f50",
    "name": "Master Lock 6835",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/366d5f50.html"
    }
  },
  {
    "id": "37951bc4",
    "name": "Yale 500+",
    "version": "without overmilling",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/37951bc4.html"
    }
  },
  {
    "id": "4f6bcdb7",
    "name": "Zarker J45/J45S",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Green",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/4f6bcdb7.html"
    }
  },
  {
    "id": "c6529d9c",
    "name": "Any SFIC format lock",
    "version": "**",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/c6529d9c.html"
    }
  },
  {
    "id": "85d93eb1",
    "name": "ABUS C73 / ABUS C83 / ABUS C90",
    "version": "new pinning: security keypins + serrated and spooled t-pins",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/85d93eb1.html"
    }
  },
  {
    "id": "5c0d870b",
    "name": "ABUS E20 / ABUS E30 / ABUS E60 / ABUS E70 / ABUS NP (6-pin)",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/5c0d870b.html"
    }
  },
  {
    "id": "9ec8706c",
    "name": "ABUS EC 75/50 / ABUS 75IB/50",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/9ec8706c.html"
    }
  },
  {
    "id": "d9e3829f",
    "name": "ASSA 500 / ASSA Flexcore/Flexcore Plus",
    "version": "5 pin with barrels and matched countermilling",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/d9e3829f.html"
    }
  },
  {
    "id": "b89d9e11",
    "name": "ASSA 500 / Ruko 500",
    "version": "with barrel drivers, no countermilling",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/b89d9e11.html"
    }
  },
  {
    "id": "d08aa492",
    "name": "ASSA 700",
    "version": "7 pin with spools and no countermilling",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/d08aa492.html"
    }
  },
  {
    "id": "f1e92541",
    "name": "ASSA 700",
    "version": "7 pin with tapered drivers",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/f1e92541.html"
    }
  },
  {
    "id": "1bee7a66",
    "name": "ASSA R502",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/1bee7a66.html"
    }
  },
  {
    "id": "111062fc",
    "name": "Bison/HYT/Lays/Qlsy Chain Key Lock",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/111062fc.html"
    }
  },
  {
    "id": "32fa52a6",
    "name": "Burg Wächter Diamant",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/32fa52a6.html"
    }
  },
  {
    "id": "5b842c0e",
    "name": "Chubb Cruiser",
    "version": "5 lever",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/5b842c0e.html"
    }
  },
  {
    "id": "1add3dd0",
    "name": "Cobra C3 Sidewinder",
    "mechanisms": [
      "Slider"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/1add3dd0.html"
    }
  },
  {
    "id": "aee424c0",
    "name": "FAB 3* Profi / FAB 4* Profi",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/aee424c0.html"
    }
  },
  {
    "id": "2801996f",
    "name": "GEGE AP1000 / GEGE AP2000 / GEGE AP3000",
    "version": "5 pins",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/2801996f.html"
    }
  },
  {
    "id": "aa7fc00e",
    "name": "Gege pExtra / Alfa \"pExtra\"",
    "version": "5 pin",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/aa7fc00e.html"
    }
  },
  {
    "id": "959a6b9d",
    "name": "GOAL S",
    "version": "5 pins",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/959a6b9d.html"
    }
  },
  {
    "id": "9b94b1c0",
    "name": "iNAHO Tierkey",
    "version": "3 row, short format",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/9b94b1c0.html"
    }
  },
  {
    "id": "ebcb29b9",
    "name": "Ingersoll 6 Lever Padlock",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/ebcb29b9.html"
    }
  },
  {
    "id": "40e50dd4",
    "name": "Kaken KX3",
    "version": "exterior, <6 sliders/wafers",
    "mechanisms": [
      "Pin-tumbler",
      "Slider",
      "Wafer"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/40e50dd4.html"
    }
  },
  {
    "id": "ab9df828",
    "name": "Kawaha Kawaha / Magmaus Magmaus",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/ab9df828.html"
    }
  },
  {
    "id": "331c9d36",
    "name": "Lockwood 334B45 / Lockwood 356S63 / Lockwood 214A40 / Lockwood 215A40 / Lockwood 270S70",
    "version": "with spools",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/331c9d36.html"
    }
  },
  {
    "id": "c0af329b",
    "name": "Mindy Pagoda (round key)",
    "mechanisms": [
      "Pump/push"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/c0af329b.html"
    }
  },
  {
    "id": "0418a174",
    "name": "Mul-T-Lock Classic",
    "version": "standard drivers",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/0418a174.html"
    }
  },
  {
    "id": "aec0c82d",
    "name": "Mul-T-Lock Classic / Mul-T-Lock Interactive",
    "version": "4 pins, 4 spooled drivers",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/aec0c82d.html"
    }
  },
  {
    "id": "a0ec1618",
    "name": "Mul-T-Lock Classic / Mul-T-Lock Interactive",
    "version": "5 pins, 3 or fewer spooled drivers",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/a0ec1618.html"
    }
  },
  {
    "id": "6e0bfdd2",
    "name": "Mul-T-Lock Integrator",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/6e0bfdd2.html"
    }
  },
  {
    "id": "1d80c9bb",
    "name": "Omellow R3",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/1d80c9bb.html"
    }
  },
  {
    "id": "fb5a9eb7",
    "name": "PACLOCK 90A Pro",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/fb5a9eb7.html"
    }
  },
  {
    "id": "37dc53bb",
    "name": "SEGA Cam Lock",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/37dc53bb.html"
    }
  },
  {
    "id": "b0d2e04c",
    "name": "Takigen 10-pin / Takigen C288",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/b0d2e04c.html"
    }
  },
  {
    "id": "35330d19",
    "name": "Tokoz Tech",
    "mechanisms": [
      "Pin-tumbler",
      "Wafer"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/35330d19.html"
    }
  },
  {
    "id": "55511995",
    "name": "TrioVing 508 / Ving Vingcard 55##",
    "version": "with trampoline pins",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/55511995.html"
    }
  },
  {
    "id": "779e7dcb",
    "name": "Yale 500 / Yale B",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/779e7dcb.html"
    }
  },
  {
    "id": "5e3397a9",
    "name": "Zeta Padlock",
    "version": "Models: ZR45, ZR55, ZU55",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Blue",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/5e3397a9.html"
    }
  },
  {
    "id": "c8259a23",
    "name": "Any SFIC format lock (unless otherwise specified)",
    "version": "**",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/c8259a23.html"
    }
  },
  {
    "id": "dd1dd313",
    "name": "ABUS XP1 / ABUS TS5000",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/dd1dd313.html"
    }
  },
  {
    "id": "ef221c67",
    "name": "ASSA 500 / Ruko 500",
    "version": "5 pin stacks, gin drivers and matching sleeve",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/ef221c67.html"
    }
  },
  {
    "id": "45e3cde7",
    "name": "ASSA 600 / ASSA Max+ Restricted / Ruko 600",
    "version": "Barrel spools and matching countermilling",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/45e3cde7.html"
    }
  },
  {
    "id": "122b5621",
    "name": "ASSA Guideline",
    "version": "6 pin with active side pins",
    "mechanisms": [
      "Pin-tumbler",
      "Sidepins"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/122b5621.html"
    }
  },
  {
    "id": "f3666121",
    "name": "Avocet ABS / ERA Professional Cylinder / Federal Lock U-systems (UCF/UCH/UCS/UUS)-3100 / Thirard Federal S / Thirard Federal 2",
    "mechanisms": [
      "Dimple",
      "Magnet"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/f3666121.html"
    }
  },
  {
    "id": "ed9fa926",
    "name": "Burg Wächter Gamma 700",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/ed9fa926.html"
    }
  },
  {
    "id": "1f3a8ff9",
    "name": "Chubb Battleship",
    "version": "6 lever, offset key",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/1f3a8ff9.html"
    }
  },
  {
    "id": "71bce5b7",
    "name": "Corbin Russwin Emhart",
    "version": "4 pins **",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/71bce5b7.html"
    }
  },
  {
    "id": "e8901d1c",
    "name": "Eagle \"Supr-Security\"",
    "version": "without shutter",
    "mechanisms": [
      "Wafer"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/e8901d1c.html"
    }
  },
  {
    "id": "8c2983b5",
    "name": "EVVA DPI / EVVA DPS / EVVA DPX / EVVA EPS",
    "version": "slider version",
    "mechanisms": [
      "Slider"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/8c2983b5.html"
    }
  },
  {
    "id": "3fbd7b3d",
    "name": "Godrej Ultra",
    "version": "14 pins in 3 rows",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/3fbd7b3d.html"
    }
  },
  {
    "id": "07bc680a",
    "name": "Illinois Duo",
    "mechanisms": [
      "Wafer"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/07bc680a.html"
    }
  },
  {
    "id": "c11aca1a",
    "name": "Ingersoll 10 lever padlock",
    "mechanisms": [
      "Lever/sidebar"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/c11aca1a.html"
    }
  },
  {
    "id": "9982c0eb",
    "name": "Lockman Megacross",
    "version": "9-pins, mushroom drivers",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/9982c0eb.html"
    }
  },
  {
    "id": "71833308",
    "name": "Lockwood Twin",
    "mechanisms": [
      "Pin-tumbler",
      "Sidepins"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/71833308.html"
    }
  },
  {
    "id": "8f7f1830",
    "name": "Master Lock #19",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/8f7f1830.html"
    }
  },
  {
    "id": "aeaa6a09",
    "name": "Medeco Original Camlock",
    "version": "≥ 5 pins ******",
    "mechanisms": [
      "Slider",
      "Sidebar"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/aeaa6a09.html"
    }
  },
  {
    "id": "826c31e0",
    "name": "Medeco Original / Medeco Biaxial / Medeco M3 / Chubb Biaxial",
    "version": "≥ 5 pins ******",
    "mechanisms": [
      "Sidebar",
      "Pin-tumbler"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/826c31e0.html"
    }
  },
  {
    "id": "06a28ac7",
    "name": "Mindy Pagoda AF 16-50",
    "version": "flat key",
    "mechanisms": [
      "Pump/push"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/06a28ac7.html"
    }
  },
  {
    "id": "3335df97",
    "name": "Mul-T-Lock Jr / Mul-T-Lock Classic / Mul-T-Lock Interactive",
    "version": "5 pin stacks, ≥ 4 spooled drivers",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/3335df97.html"
    }
  },
  {
    "id": "6d754a0a",
    "name": "Rielda rekeyable lock",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/6d754a0a.html"
    }
  },
  {
    "id": "3dabf132",
    "name": "Schlage Everest 29SL",
    "mechanisms": [
      "Slider"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/3dabf132.html"
    }
  },
  {
    "id": "1be10736",
    "name": "Yale 5000",
    "mechanisms": [
      "Pin-tumbler",
      "Slider"
    ],
    "belt": "Purple",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/1be10736.html"
    }
  },
  {
    "id": "b13f4b57",
    "name": "Any SFIC with security pins",
    "version": "**",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/b13f4b57.html"
    }
  },
  {
    "id": "da09d849",
    "name": "Abloy Classic",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/da09d849.html"
    }
  },
  {
    "id": "b8350900",
    "name": "ABUS Plus",
    "version": "no butterfly discs",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/b8350900.html"
    }
  },
  {
    "id": "d3ad5a73",
    "name": "ASSA d12 / ASSA P600 / ASSA Neptun 1900 / Ruko Merkur / TrioVing d12 level 1 / Ruko 1200",
    "version": "barrel drivers, forked keypins, optional long pin",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/d3ad5a73.html"
    }
  },
  {
    "id": "1459e2c6",
    "name": "ASSA Desmo",
    "version": "8 sliders, no mastered pins",
    "mechanisms": [
      "Slider"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/1459e2c6.html"
    }
  },
  {
    "id": "e38d015b",
    "name": "Burg Wächter Alpha 800",
    "mechanisms": [
      "Wafer"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/e38d015b.html"
    }
  },
  {
    "id": "9c627ebd",
    "name": "Fichet 666",
    "mechanisms": [
      "Slider"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/9c627ebd.html"
    }
  },
  {
    "id": "86e86a1d",
    "name": "FTH Thirard Cobra",
    "mechanisms": [
      "Pump/push"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/86e86a1d.html"
    }
  },
  {
    "id": "a1233156",
    "name": "GOAL P",
    "version": "6 pin",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/a1233156.html"
    }
  },
  {
    "id": "ea1afad0",
    "name": "Schlage Primus / Schlage Everest Primus",
    "mechanisms": [
      "Pin-tumbler",
      "Sidepins"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/ea1afad0.html"
    }
  },
  {
    "id": "626da374",
    "name": "Scorpion CX-5 / Marks High Security Lock",
    "mechanisms": [
      "Pin-tumbler",
      "Slider"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/626da374.html"
    }
  },
  {
    "id": "506b242a",
    "name": "Van Lock",
    "mechanisms": [
      "Pump/push"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/506b242a.html"
    }
  },
  {
    "id": "dd764207",
    "name": "VSR 3-row",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/dd764207.html"
    }
  },
  {
    "id": "93e4cf5f",
    "name": "Walsall Locks 2000",
    "version": "5 lever",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Brown",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/93e4cf5f.html"
    }
  },
  {
    "id": "b8350901",
    "name": "ABUS Plus",
    "version": "with butterfly discs",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/b8350901.html"
    }
  },
  {
    "id": "29ab2852",
    "name": "ASSA 600 / Ruko 600",
    "version": "6 pin, with gin spools and matched countermilling",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/29ab2852.html"
    }
  },
  {
    "id": "75fb1e5c",
    "name": "ASSA dp2400 / ASSA dp10 / TrioVing System 10 / Ruko DP2",
    "version": "6 pin 4 slider",
    "mechanisms": [
      "Pin-tumbler",
      "Sidepins"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/75fb1e5c.html"
    }
  },
  {
    "id": "3af2407a",
    "name": "BKS Janus",
    "version": "< 13 pins",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/3af2407a.html"
    }
  },
  {
    "id": "9f613c4a",
    "name": "GOAL V18 / GOAL GP",
    "version": "<14 pins",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/9f613c4a.html"
    }
  },
  {
    "id": "281aa393",
    "name": "Kromer Novum",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/281aa393.html"
    }
  },
  {
    "id": "814c5368",
    "name": "MIWA LS7",
    "mechanisms": [
      "Slider"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/814c5368.html"
    }
  },
  {
    "id": "9da7a5f2",
    "name": "Robur 2391 Safe Deposit Lock",
    "version": "barrels ≥ 3 chambers with matched milling",
    "mechanisms": [
      "Pin-tumbler",
      "Sidepins"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/9da7a5f2.html"
    }
  },
  {
    "id": "112d0034",
    "name": "Robur 2391 Safe Deposit Lock",
    "version": "gins ≥ 3 chambers with matched milling",
    "mechanisms": [
      "Pin-tumbler",
      "Sidepins"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/112d0034.html"
    }
  },
  {
    "id": "4a7db3c6",
    "name": "Rosengrens 32A / Rosengrens 32A8",
    "version": "thin round center posts, few or no False gates",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/4a7db3c6.html"
    }
  },
  {
    "id": "2ff8a738",
    "name": "S&G 4440 series",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/2ff8a738.html"
    }
  },
  {
    "id": "cf76cfde",
    "name": "Schlage Everest 29 SL Primus XP",
    "mechanisms": [
      "Slider",
      "Sidepins"
    ],
    "belt": "Red",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/cf76cfde.html"
    }
  },
  {
    "id": "e87f0ca2",
    "name": "Abloy Protec2",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Black",
    "beltLevel": "Black 3",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/e87f0ca2.html"
    }
  },
  {
    "id": "2ae6a691",
    "name": "Abloy Sentry",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/2ae6a691.html"
    }
  },
  {
    "id": "f133510b",
    "name": "ASSA 700",
    "version": "gin/tree pins and matching countermilling in ≥ 4 chambers, ≥ 2 tree pins",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/f133510b.html"
    }
  },
  {
    "id": "104776ef",
    "name": "ASSA Twin 6000",
    "version": "gin drivers, 6 stacks with 5 side pins",
    "mechanisms": [
      "Pin-tumbler",
      "Sidepins"
    ],
    "belt": "Black",
    "beltLevel": "Black 2",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/104776ef.html"
    }
  },
  {
    "id": "7168d463",
    "name": "ASSA Twin Combi / ASSA Triton / ASSA Neptun 4900 / TrioVing Twin Control",
    "version": "6 pin with 5 finger pins",
    "mechanisms": [
      "Pin-tumbler",
      "Sidepins"
    ],
    "belt": "Black",
    "beltLevel": "Black 2",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/7168d463.html"
    }
  },
  {
    "id": "55053299",
    "name": "ASSA Twin Exclusive / ASSA Twin 6000",
    "version": "6 barrel drivers, 5 side pins",
    "mechanisms": [
      "Pin-tumbler",
      "Sidepins"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/55053299.html"
    }
  },
  {
    "id": "3f73d2ce",
    "name": "ASSA Twin Maximum / ASSA Twin Pro / ASSA Twin v10 / ASSA Twin 2 / ASSA Twin Global",
    "version": "barrel driver, 6 stacks with 5 side pins",
    "mechanisms": [
      "Pin-tumbler",
      "Sidepins"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/3f73d2ce.html"
    }
  },
  {
    "id": "ab1e901f",
    "name": "Australian Lock Co. BiLock",
    "version": "12 sliders, 0 mastered",
    "mechanisms": [
      "Slider"
    ],
    "belt": "Black",
    "beltLevel": "Black 2",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/ab1e901f.html"
    }
  },
  {
    "id": "c6a14e93",
    "name": "CAWI 7113 / CAWI 7123",
    "mechanisms": [
      "Wafer"
    ],
    "belt": "Black",
    "beltLevel": "Black 3",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/c6a14e93.html"
    }
  },
  {
    "id": "2181e10d",
    "name": "Chatwood Invincible",
    "version": "Single Bitted",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Black",
    "beltLevel": "Black 5",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/2181e10d.html"
    }
  },
  {
    "id": "2db935ea",
    "name": "Chubb \"Definitive\"",
    "version": "jewelry box (steel comb leaf spring, pin or pipe key)",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Black",
    "beltLevel": "Black 4",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/2db935ea.html"
    }
  },
  {
    "id": "3c73c705",
    "name": "DOM ix Twinstar",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/3c73c705.html"
    }
  },
  {
    "id": "f7452b9f",
    "name": "EVVA 3KS / EVVA 3KS+",
    "version": "false gates and no mastered sliders",
    "mechanisms": [
      "Slider"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/f7452b9f.html"
    }
  },
  {
    "id": "340154fa",
    "name": "Fichet 450 / Fichet 484",
    "version": "w/ False gates, 0 mastered levers",
    "mechanisms": [
      "Lever/sidebar"
    ],
    "belt": "Black",
    "beltLevel": "Black 2",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/340154fa.html"
    }
  },
  {
    "id": "3ca098da",
    "name": "GOAL Grand V",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Black",
    "beltLevel": "Black 3",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/3ca098da.html"
    }
  },
  {
    "id": "5103e650",
    "name": "GOAL Z",
    "version": "< 2 standard drivers",
    "mechanisms": [
      "Pin-tumbler"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/5103e650.html"
    }
  },
  {
    "id": "f87db705",
    "name": "Kromer Protector (BP55K)",
    "mechanisms": [
      "Wafer"
    ],
    "belt": "Black",
    "beltLevel": "Black 5",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/f87db705.html"
    }
  },
  {
    "id": "f1857cef",
    "name": "Lockman Megacross",
    "version": "with pyramid drivers",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/f1857cef.html"
    }
  },
  {
    "id": "d1272b9f",
    "name": "MIWA U9",
    "version": "9 unmastered elements, barred False gates (old shallow False gates counts as BB1)",
    "mechanisms": [
      "Lever/sidebar"
    ],
    "belt": "Black",
    "beltLevel": "Black 2",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/d1272b9f.html"
    }
  },
  {
    "id": "ccdbffbf",
    "name": "MIWA WR",
    "mechanisms": [
      "Slider"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/ccdbffbf.html"
    }
  },
  {
    "id": "649eaebc",
    "name": "Mul-T-Lock MT5+ / Mul-T-Lock 800 / Lockwood MT5 / IKON R10",
    "version": "not mastered",
    "mechanisms": [
      "Dimple",
      "Slider"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/649eaebc.html"
    }
  },
  {
    "id": "f29a212f",
    "name": "NATO Mersey",
    "version": "14 lever",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Black",
    "beltLevel": "Black 5",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/f29a212f.html"
    }
  },
  {
    "id": "6c0ec943",
    "name": "Opnus Memolis",
    "mechanisms": [
      "Lever/sidebar"
    ],
    "belt": "Black",
    "beltLevel": "Black 4",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/6c0ec943.html"
    }
  },
  {
    "id": "5cba063b",
    "name": "Robur Disc Detainer Safe Deposit Lock",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Black",
    "beltLevel": "Black 2",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/5cba063b.html"
    }
  },
  {
    "id": "63a9a2b1",
    "name": "Ruko Combi 2 / Ruko Garant 10 / FAB Variant",
    "version": "6 pin with 5 finger pins",
    "mechanisms": [
      "Pin-tumbler",
      "Sidepins"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/63a9a2b1.html"
    }
  },
  {
    "id": "00cf7717",
    "name": "Sargent Keso",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/00cf7717.html"
    }
  },
  {
    "id": "3198fffc",
    "name": "Tokoz Pro",
    "mechanisms": [
      "Disc detainer"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/3198fffc.html"
    }
  },
  {
    "id": "e4bb0668",
    "name": "UrbanAlps Stealth Key SK1",
    "mechanisms": [
      "Lever/sidebar"
    ],
    "belt": "Black",
    "beltLevel": "Black 1",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/e4bb0668.html"
    }
  },
  {
    "id": "e718b140",
    "name": "Western Electric 30B",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Black",
    "beltLevel": "Black 5",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/e718b140.html"
    }
  },
  {
    "id": "5a4310d5",
    "name": "Western Electric 30C",
    "mechanisms": [
      "Lever"
    ],
    "belt": "Black",
    "beltLevel": "Black 5",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/5a4310d5.html"
    }
  },
  {
    "id": "0b604114",
    "name": "Yuema 750 series / Forte Enigma",
    "mechanisms": [
      "Slider"
    ],
    "belt": "Black",
    "beltLevel": "Black 5",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/0b604114.html"
    }
  },
  {
    "id": "e35a3c91",
    "name": "Bovii LOTO",
    "version": "dimple lock",
    "mechanisms": [
      "Dimple"
    ],
    "belt": "Unranked",
    "resourceLinks": {
      "lpu": "https://lpubelts.com/locks/e35a3c91.html"
    }
  }
];

const ownedLockIds = new Set([
  "901b35b2",
  "2455f0ae",
  "40f7d7c7",
  "632f4069",
  "74a00ae3",
  "e1625c4d",
  "2ae1e0b8",
  "4f6bcdb7",
  "c6529d9c",
  "85d93eb1",
  "959a6b9d",
  "331c9d36",
  "fb5a9eb7",
  "c8259a23",
  "45e3cde7",
  "826c31e0",
  "b13f4b57",
  "d3ad5a73",
  "b8350901",
  "29ab2852",
  "2ae6a691",
  "104776ef",
  "aeaa6a09",
  "639c4f0b",
  "3335df97",
  "55053299",
  "ab1e901f",
  "e87f0ca2",
  "d974b48f",
  "efc01233",
  "5c0d870b",
  "ea1afad0",
  "55511995",
  "112d0034",
  "f133510b",
  "58307da0",
  "779e7dcb",
  "222bd1fa",
  "b8350900",
  "2484ce70",
  "9ec8706c",
  "171f76e9",
  "2ff8a738",
  "7168d463",
  "37951bc4",
  "9ca2c109",
  "e35a3c91",
  "a460c971",
  "1459e2c6",
  "bf8970de",
  "366d5f50",
  "5a6170fb",
  "06a28ac7",
  "d9e3829f",
  "506b242a",
  "35330d19",
  "3198fffc",
  "aee424c0",
  "0b604114",
  "cd0c2ff9",
  "3c73c705",
  "1d80c9bb",
  "a1233156",
  "5103e650",
  "562e964e",
  "13b06cba",
  "71833308",
  "f1e92541",
  "d08aa492",
  "dd764207",
  "111062fc",
  "814c5368",
  "0b82681f",
  "c942490e",
  "ea1d1d8c",
  "da09d849",
  "e4bb0668",
  "07034c0f"
]);
const pickedLockIds = new Set([
  "07034c0f",
  "901b35b2",
  "2455f0ae",
  "40f7d7c7",
  "632f4069",
  "2ae1e0b8",
  "fb5a9eb7",
  "779e7dcb",
  "959a6b9d",
  "efc01233",
  "562e964e"
]);

export const locks: LockRecord[] = lockCatalog.map((lock) => ({
  ...lock,
  status: ownedLockIds.has(lock.id) ? "Owned" : "Wishlist",
  picked: pickedLockIds.has(lock.id),
}));

export const ownedLocks = locks.filter((lock) => lock.status === "Owned");
export const wishlistLocks = locks.filter((lock) => lock.status === "Wishlist");

export const beltCounts = Object.fromEntries(
  beltOrder.map((belt) => [belt, ownedLocks.filter((lock) => lock.belt === belt).length]),
) as Record<Belt, number>;

export const mechanismCounts = Object.entries(
  ownedLocks.reduce<Record<string, number>>((counts, lock) => {
    lock.mechanisms.forEach((mechanism) => {
      counts[mechanism] = (counts[mechanism] ?? 0) + 1;
    });
    return counts;
  }, {}),
)
  .map(([label, value]) => ({ label, value }))
  .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

const brandFamilies = [
  "ASSA",
  "ABUS",
  "Master Lock",
  "Ruko",
  "Mul-T-Lock",
  "Schlage",
  "GOAL",
  "Burg Wächter",
  "Yale",
  "Lockwood",
  "Chubb",
  "FAB",
];

export const brandCounts = brandFamilies
  .map((label) => ({
    label,
    value: ownedLocks.filter((lock) => lock.name.includes(label)).length,
  }))
  .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
