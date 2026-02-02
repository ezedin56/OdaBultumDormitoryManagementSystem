import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin/dashboard');
            else navigate('/'); // Student or unknown role
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await login(formData.username, formData.password);
            if (!result.success) {
                setError(result.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-color)', position: 'relative' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpWVhGUfDQPtwCOjcwTE3tQiAl0obKpwvN1A&s" 
                        alt="OBU Logo" 
                        style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'contain',
                            margin: '0 auto 1rem',
                            display: 'block'
                        }} 
                    />
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '700' }}>Dormitory Management</h2>
                    <p className="text-muted" style={{ margin: 0 }}>Sign in to your account</p>
                </div>

                {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Username</label>
                        <input
                            type="text"
                            name="username"
                            className="input-field"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="input-field"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary mt-2"
                        disabled={isLoading}
                        style={{ 
                            opacity: isLoading ? 0.7 : 1, 
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            position: 'relative',
                            zIndex: 10,
                            pointerEvents: 'auto'
                        }}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
