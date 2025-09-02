import axios from 'axios';
import { useCart } from '../../context/CartContext';

export async function getServerSideProps(context) {
  const { id } = context.params;
  const res = await axios.get(`http://localhost:5000/products/${id}`);
  return { props: { product: res.data } };
}

export default function ProductDetail({ product }) {
  const { addToCart } = useCart();

  return (
    <div>
      <h1>{product.name}</h1>
      <img src={product.image_url} alt={product.name} style={{ width: '300px' }} />
      <p>{product.description}</p>
      <p><b>₹{product.price}</b></p>

      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
}
