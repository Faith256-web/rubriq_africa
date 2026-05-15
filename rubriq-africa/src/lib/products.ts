// Static product catalog (no backend yet) — prices in UGX.
// Replace with API/database fetch when backend is added.
import ecoRubberBrick from "@/assets/eco_rubber_bricks.png";
import rubberPaver from "@/assets/rubberPaver.jpg";
import coloredPaver from "@/assets/coloredPaver.jpg";
import rubberBricks from "@/assets/rubber_bricks.png";
import rubberPaverPallet from "@/assets/rubber_paver_pallet.png";

export type Product = {
  id: string;
  name: string;
  category: "Bricks" | "Pavers" | "Blocks";
  price: number; // UGX, per unit
  unit: string;
  image: string;
  description: string;
  stock: number;
};

export const products: Product[] = [
  {
    id: "ecoRubberBrick",
    name: "Eco-Rubber Brick",
    category: "Bricks",
    price: 1200,
    unit: "per brick",
    image: ecoRubberBrick,
    description: "Kiln-fired solid clay brick — load-bearing walls and facades.",
    stock: 18000,
  },
  {
    id: "rubberPaver",
    name: "Rubber Paver",
    category: "Pavers",
    price: 2500,
    unit: "per paver",
    image: rubberPaver,
    description: "Standard grey interlocking paver for driveways and walkways.",
    stock: 9400,
  },
  {
    id: "coloredPaver",
    name: "Colored Paver",
    category: "Pavers",
    price: 4800,
    unit: "per paver",
    image: coloredPaver,
    description: "Eco-friendly paver made from recycled tires — slip resistant.",
    stock: 3200,
  },
  {
    id: "rubberBricks",
    name: "Rubber Bricks",
    category: "Bricks",
    price: 1200,
    unit: "per brick",
    image: rubberBricks,
    description: "Lightweight hollow block for fast wall construction.",
    stock: 6700,
  },
  {
    id: "rubberpaverpallet",
    name: "Rubber Paver Pallet",
    category: "Pavers",
    price: 3800,
    unit: "per paver",
    image: rubberPaverPallet,
    description: "Classic cobblestone profile for premium courtyards.",
    stock: 5100,
  },
  // {
  //   id: "kerb-stone",
  //   name: "Road Kerb Stone",
  //   category: "Kerbs",
  //   price: 18000,
  //   unit: "per kerb",
  //   image: kerb,
  //   description: "Heavy-duty kerb stone for road edging and landscaping.",
  //   stock: 1200,
  // },
];

// Format a number as UGX currency (e.g. 1,200 UGX).
export const formatUGX = (n: number) =>
  new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(n);
