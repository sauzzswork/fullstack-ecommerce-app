// pages/index.js
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '../context/CartContext';  // Import your cart hook

export async function getServerSideProps() {
  const res = await axios.get('http://localhost:5000/products');
  return {
    props: { products: res.data }
  };
}

export default function Home({ products }) {
  const { addToCart } = useCart();  // Access addToCart function from context

  return (
    <div>
      <h1>Product Catalog</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: '1px solid #ccc',
              padding: '16px',
              margin: '8px',
              width: '200px'
            }}
          >
            <h2>{product.name}</h2>
            <img src={product.image_url} alt={product.name} style={{ width: '100%' }} />
            <p>{product.description}</p>

            <button onClick={() => addToCart(product)}>Add to Cart</button> {/* Add to Cart button */}

            <Link href={`/product/${product.id}`} passHref>
              <button>View Details</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
