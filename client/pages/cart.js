import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  // Local state to track input values for quantities
  const [quantities, setQuantities] = useState(
    cartItems.reduce((acc, item) => {
      acc[item.id] = item.quantity;
      return acc;
    }, {})
  );

  // Handle input change for quantity
  const handleChange = (id, value) => {
    const qty = parseInt(value);
    if (qty > 0) {
      setQuantities(prev => ({ ...prev, [id]: qty }));
      updateQuantity(id, qty);
    }
  };

  if (cartItems.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h1>Your Cart</h1>
      <ul>
        {cartItems.map(item => (
          <li key={item.id} style={{ marginBottom: '1rem' }}>
            <h2>{item.name}</h2>
            <p>Price: ₹{item.price}</p>
            <label>
              Quantity:
              <input
                type="number"
                min="1"
                value={quantities[item.id]}
                onChange={(e) => handleChange(item.id, e.target.value)}
                style={{ width: '50px', marginLeft: '8px' }}
              />
            </label>
            <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: '12px' }}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
      {/* Add checkout button and functionality here */}
    </div>
  );
}
