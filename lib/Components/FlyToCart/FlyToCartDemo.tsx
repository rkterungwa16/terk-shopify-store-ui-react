"use client";
import { useRef, useState } from "react";
import { useFlyToCart } from "./useFlyToCart";
import demoStyles from "./FlyToCartDemo.module.css";

interface Product {
  id: number;
  name: string;
  price: string;
  color: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Canvas Tote", price: "$28", color: "#d8c3a5" },
  { id: 2, name: "Ceramic Mug", price: "$16", color: "#a5b8c9" },
  { id: 3, name: "Wool Beanie", price: "$22", color: "#c9a5a5" },
  { id: 4, name: "Notebook", price: "$12", color: "#a5c9ae" },
];

export default function FlyToCartDemo() {
  const { fly, FlyToCartLayer } = useFlyToCart();
  const cartRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [bump, setBump] = useState(false);

  const handleAddToCart = (imageEl: HTMLImageElement | null) => {
    if (!imageEl || !cartRef.current) return;

    fly(imageEl, {
      destination: cartRef.current,
      useSourceSize: true,
      content: <img src={imageEl.src} alt="" />,
    });

    window.setTimeout(() => {
      setCount((c) => c + 1);
      setBump(true);
      window.setTimeout(() => setBump(false), 150);
    }, 550);
  };

  return (
    <div className={demoStyles.page}>
      <div
        ref={cartRef}
        className={`${demoStyles.cartIcon} ${bump ? demoStyles.bump : ""}`}
      >
        🛒
        <span className={demoStyles.count}>{count}</span>
      </div>

      <h1>Fly to Cart — React TSX</h1>
      <p className={demoStyles.sub}>Click {"Add to cart"} on any product.</p>

      <div className={demoStyles.grid}>
        {PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={handleAddToCart}
          />
        ))}
      </div>

      <FlyToCartLayer />
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAdd: (imageEl: HTMLImageElement | null) => void;
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div className={demoStyles.card}>
      <img
        ref={imgRef}
        src={swatchDataUri(product.color)}
        alt={product.name}
        className={demoStyles.image}
      />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button
        className={demoStyles.addBtn}
        onClick={() => onAdd(imgRef.current)}
      >
        Add to cart
      </button>
    </div>
  );
}

function swatchDataUri(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="${color}"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
