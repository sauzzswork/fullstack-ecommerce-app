import { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const router = useRouter();

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Replace userId with actual user info from auth (hardcoded here as example)
      const userId = 1;

      const orderData = {
        userId,
        shippingInfo,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      await axios.post('http://localhost:5000/orders', orderData);

      setSuccess('Order placed successfully!');
      // Optionally clear cart here or redirect
      router.push('/'); // Redirect to home or order confirmation page
    } catch (err) {
      setError('Failed to place order. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Checkout</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input name="name" value={shippingInfo.name} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Address:
          <input name="address" value={shippingInfo.address} onChange={handleChange} required />
        </label>
        <br />
        <label>
          City:
          <input name="city" value={shippingInfo.city} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Postal Code:
          <input name="postalCode" value={shippingInfo.postalCode} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Country:
          <input name="country" value={shippingInfo.country} onChange={handleChange} required />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
