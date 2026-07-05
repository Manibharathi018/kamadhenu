import s1 from "@/assets/saree-1.jpg";
import s2 from "@/assets/saree-2.jpg";
import s3 from "@/assets/saree-3.jpg";
import s4 from "@/assets/saree-4.jpg";
import s5 from "@/assets/saree-5.jpg";
import s6 from "@/assets/saree-6.jpg";

export type Product = {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  fabric: string;
  occasion: string;
  color: string;
  category: string;
  description: string;
};

// Fallback products data (used when Supabase is not available)
export const products: Product[] = [
  { id: "kp-001", name: "Rani Vastra Royal Maroon Kanchipuram", price: 28500, mrp: 34000, image: s2, fabric: "Pure Silk", occasion: "Wedding", color: "Maroon", category: "Pure Brocade", description: "An heirloom maroon Kanchipuram silk saree, woven with traditional peacock motifs and a rich gold zari pallu, certified by the Silk Mark of India." },
  { id: "kp-002", name: "Mayil Emerald Temple Kanchipuram", price: 24900, mrp: 29500, image: s3, fabric: "Pure Silk", occasion: "Festive", color: "Green", category: "Butta Sarees", description: "Lush emerald green silk with intricate temple border, hand-woven in Kanchipuram by master weavers." },
  { id: "kp-003", name: "Neelambari Royal Blue Silk", price: 26500, mrp: 31000, image: s4, fabric: "Pure Silk", occasion: "Wedding", color: "Blue", category: "Pure Jakkad", description: "Deep royal blue Kanchipuram silk with elaborate gold mango motif border and pallu." },
  { id: "kp-004", name: "Swarna Mustard Festive Silk", price: 18900, mrp: 22500, image: s5, fabric: "Pure Silk", occasion: "Festive", color: "Yellow", category: "Korvai Sarees", description: "Sun-kissed mustard silk saree with classic Arani weave and golden zari accents." },
  { id: "kp-005", name: "Gulabi Blush Pink Kanchipuram", price: 22000, mrp: 26000, image: s6, fabric: "Pure Silk", occasion: "Reception", color: "Pink", category: "Pure Checked Butta", description: "Soft blush pink Kanchipuram with delicate gold floral border — a modern bride's heirloom." },
  { id: "kp-006", name: "Raja Rani Royal Purple Silk", price: 32500, mrp: 38000, image: s1, fabric: "Pure Silk", occasion: "Wedding", color: "Purple", category: "Pure Brocade", description: "The crown of our wedding collection — deep royal purple silk with ornate temple zari border." },
];

export const getProduct = (id: string) => products.find(p => p.id === id);

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
