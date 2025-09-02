import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Replace with your backend login API
      const res = await axios.post('http://localhost:5000/users/login', form);
      // Store token or user data as needed (localStorage/session)
      // For now just redirect
      router.push('/');
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
}