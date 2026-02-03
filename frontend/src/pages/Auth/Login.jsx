import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, LogIn, Mail, Phone } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.isAdmin || user.role?.name) {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
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
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: '#f8f9fa'
        }}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '1rem 2rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    {/* Left side - Logo and University Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img 
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpWVhGUfDQPtwCOjcwTE3tQiAl0obKpwvN1A&s" 
                            alt="OBU Logo" 
                            style={{ 
                                width: '50px', 
                                height: '50px', 
                                objectFit: 'contain',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '4px'
                            }} 
                        />
                        <div>
                            <h1 style={{ 
                                margin: 0, 
                                fontSize: '1.5rem', 
                                fontWeight: '700',
                                color: 'white'
                            }}>
                                Oda Bultum University
                            </h1>
                            <p style={{ 
                                margin: 0, 
                                fontSize: '0.9rem',
                                color: 'rgba(255,255,255,0.9)'
                            }}>
                                Dormitory Management System
                            </p>
                        </div>
                    </div>

                    {/* Right side - Contact Info */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '1.5rem',
                        color: 'white',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={18} />
                            <span>info@obu.edu.et</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Phone size={18} />
                            <span>+251-25-551-1234</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ 
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                backgroundColor: '#f8f9fa',
                minHeight: 'calc(100vh - 140px)'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '450px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '3rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    animation: 'slideIn 0.8s ease-out'
                }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <img 
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpWVhGUfDQPtwCOjcwTE3tQiAl0obKpwvN1A&s" 
                                alt="OBU Logo" 
                                style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    objectFit: 'contain',
                                    margin: '0 auto 1.5rem',
                                    display: 'block'
                                }} 
                            />
                            <h2 style={{ 
                                margin: '0 0 0.5rem 0', 
                                fontSize: '2rem', 
                                fontWeight: '800',
                                color: '#2d3748',
                                fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
                                letterSpacing: '-0.5px'
                            }}>
                                Log In
                            </h2>
                            <p style={{ 
                                margin: 0,
                                color: '#718096',
                                fontSize: '0.95rem'
                            }}>
                                Enter your credentials to access your account
                            </p>
                        </div>

                        {error && (
                            <div style={{ 
                                color: '#e53e3e',
                                backgroundColor: '#fff5f5',
                                border: '1px solid #feb2b2',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                fontSize: '0.9rem',
                                marginBottom: '1.5rem',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ 
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    display: 'block',
                                    color: '#2d3748'
                                }}>
                                    Username
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User 
                                        size={20} 
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#a0aec0'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 2.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ 
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    display: 'block',
                                    color: '#2d3748'
                                }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock 
                                        size={20} 
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#a0aec0'
                                        }}
                                    />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 2.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{ 
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: isLoading 
                                        ? 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)'
                                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                                    transform: 'translateY(0)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '3px solid rgba(255,255,255,0.3)',
                                            borderTop: '3px solid white',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite'
                                        }} />
                                        Logging In...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        Log In
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
            </div>

            {/* Footer */}
            <footer style={{
                background: '#000000',
                color: 'white',
                textAlign: 'center',
                padding: '1.5rem',
                fontSize: '0.9rem',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
            }}>
                Copyright © 2026 Oda Bultum University. All rights reserved.
            </footer>

            {/* Animations */}
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (max-width: 768px) {
                    header > div {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    header > div > div:last-child {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
