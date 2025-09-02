import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Replace with your backend register API
      const res = await axios.post('http://localhost:5000/users/register', form);
      // After registration, redirect to login or home
      router.push('/login');
    } catch (err) {
      setError('Error registering user.');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input name="name" type="text" value={form.name} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Email:
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Password:
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}