import { useState, useEffect } from 'react';
import { Lock, Save, Shield } from 'lucide-react';
import axios from 'axios';

const SecuritySettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/admin/security/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings(data.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!window.confirm('Are you sure you want to update security settings? This will affect all admins.')) return;
        
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/admin/security/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to update settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const updatePasswordPolicy = (field, value) => {
        setSettings(prev => ({
            ...prev,
            passwordPolicy: {
                ...prev.passwordPolicy,
                [field]: value
            }
        }));
    };

    const updateLoginSecurity = (field, value) => {
        setSettings(prev => ({
            ...prev,
            loginSecurity: {
                ...prev.loginSecurity,
                [field]: value
            }
        }));
    };

    const updateIPRestrictions = (field, value) => {
        setSettings(prev => ({
            ...prev,
            ipRestrictions: {
                ...prev.ipRestrictions,
                [field]: value
            }
        }));
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading security settings...</div>;
    }

    if (!settings) {
        return <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>Failed to load settings</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={24} />
                        Security Settings
                    </h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Configure system-wide security policies</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ gap: '0.5rem' }}
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Password Policy */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} />
                    Password Policy
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            Minimum Length
                        </label>
                        <input
                            type="number"
                            min="6"
                            max="32"
                            value={settings.passwordPolicy.minLength}
                            onChange={(e) => updatePasswordPolicy('minLength', parseInt(e.target.value))}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            Password Expiry (Days)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={settings.passwordPolicy.passwordExpiryDays}
                            onChange={(e) => updatePasswordPolicy('passwordExpiryDays', parseInt(e.target.value))}
                            className="input-field"
                        />
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>0 = Never expires</p>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <input
                                type="checkbox"
                                checked={settings.passwordPolicy.requireUppercase}
                                onChange={(e) => updatePasswordPolicy('requireUppercase', e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Require Uppercase</span>
                        </label>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <input
                                type="checkbox"
                                checked={settings.passwordPolicy.requireLowercase}
                                onChange={(e) => updatePasswordPolicy('requireLowercase', e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Require Lowercase</span>
                        </label>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <input
                                type="checkbox"
                                checked={settings.passwordPolicy.requireNumbers}
                                onChange={(e) => updatePasswordPolicy('requireNumbers', e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Require Numbers</span>
                        </label>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <input
                                type="checkbox"
                                checked={settings.passwordPolicy.requireSpecialChars}
                                onChange={(e) => updatePasswordPolicy('requireSpecialChars', e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Require Special Characters</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Login Security */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>Login Security</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            Max Login Attempts
                        </label>
                        <input
                            type="number"
                            min="3"
                            max="10"
                            value={settings.loginSecurity.maxLoginAttempts}
                            onChange={(e) => updateLoginSecurity('maxLoginAttempts', parseInt(e.target.value))}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            Lockout Duration (Minutes)
                        </label>
                        <input
                            type="number"
                            min="5"
                            value={settings.loginSecurity.lockoutDurationMinutes}
                            onChange={(e) => updateLoginSecurity('lockoutDurationMinutes', parseInt(e.target.value))}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            Session Timeout (Minutes)
                        </label>
                        <input
                            type="number"
                            min="5"
                            value={settings.loginSecurity.sessionTimeoutMinutes}
                            onChange={(e) => updateLoginSecurity('sessionTimeoutMinutes', parseInt(e.target.value))}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <input
                                type="checkbox"
                                checked={settings.loginSecurity.require2FA}
                                onChange={(e) => updateLoginSecurity('require2FA', e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Require 2FA</span>
                        </label>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', marginLeft: '0.75rem' }}>
                            Two-factor authentication for all admins
                        </p>
                    </div>
                </div>
            </div>

            {/* IP Restrictions */}
            <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>IP Restrictions</h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <input
                            type="checkbox"
                            checked={settings.ipRestrictions.enabled}
                            onChange={(e) => updateIPRestrictions('enabled', e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Enable IP Restrictions</span>
                    </label>
                </div>

                {settings.ipRestrictions.enabled && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                Allowed IPs (comma-separated)
                            </label>
                            <textarea
                                value={settings.ipRestrictions.allowedIPs?.join(', ') || ''}
                                onChange={(e) => updateIPRestrictions('allowedIPs', e.target.value.split(',').map(ip => ip.trim()).filter(Boolean))}
                                className="input-field"
                                rows={4}
                                placeholder="192.168.1.1, 10.0.0.1"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                Blocked IPs (comma-separated)
                            </label>
                            <textarea
                                value={settings.ipRestrictions.blockedIPs?.join(', ') || ''}
                                onChange={(e) => updateIPRestrictions('blockedIPs', e.target.value.split(',').map(ip => ip.trim()).filter(Boolean))}
                                className="input-field"
                                rows={4}
                                placeholder="192.168.1.100, 10.0.0.50"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecuritySettings;
