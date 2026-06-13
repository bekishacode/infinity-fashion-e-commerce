import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

const EmailLayoutSettings: React.FC = () => {
  const [layout, setLayout] = useState({
    logo_url: '',
    primary_color: '#273B89',
    secondary_color: '#EC2D7B',
    font_family: 'Arial, sans-serif',
    company_name: 'Style Badge',
    company_address: '',
    company_phone: '',
    company_email: '',
    website_url: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLayoutSettings();
  }, []);

  const fetchLayoutSettings = async () => {
    try {
      const result = await adminService.getEmailLayoutSettings() as ApiResponse<any>;
      if (result.success && result.data) {
        setLayout({
          logo_url: result.data.logo_url || '',
          primary_color: result.data.primary_color || '#273B89',
          secondary_color: result.data.secondary_color || '#EC2D7B',
          font_family: result.data.font_family || 'Arial, sans-serif',
          company_name: result.data.company_name || 'Style Badge',
          company_address: result.data.company_address || '',
          company_phone: result.data.company_phone || '',
          company_email: result.data.company_email || '',
          website_url: result.data.website_url || '',
          social_facebook: result.data.social_facebook || '',
          social_instagram: result.data.social_instagram || '',
          social_twitter: result.data.social_twitter || ''
        });
      }
    } catch (error) {
      console.error('Error fetching layout settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await adminService.updateEmailLayoutSettings(layout) as ApiResponse<any>;
      if (result.success) {
        setMessage({ type: 'success', text: 'Layout settings saved successfully!' });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Email <span className="text-royal-blue">Layout Settings</span></h1>
        <p className="text-gray-500 text-sm">Configure global email branding and appearance</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Branding */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input
                type="text"
                value={layout.logo_url}
                onChange={(e) => setLayout({ ...layout, logo_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="https://yourdomain.com/logo.png"
              />
              <p className="text-xs text-gray-400 mt-1">Upload logo to /uploads/ folder</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={layout.company_name}
                onChange={(e) => setLayout({ ...layout, company_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={layout.primary_color}
                  onChange={(e) => setLayout({ ...layout, primary_color: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={layout.primary_color}
                  onChange={(e) => setLayout({ ...layout, primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Secondary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={layout.secondary_color}
                  onChange={(e) => setLayout({ ...layout, secondary_color: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={layout.secondary_color}
                  onChange={(e) => setLayout({ ...layout, secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Font Family</label>
              <select
                value={layout.font_family}
                onChange={(e) => setLayout({ ...layout, font_family: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="'Segoe UI', sans-serif">Segoe UI</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Address</label>
              <textarea
                rows={2}
                value={layout.company_address}
                onChange={(e) => setLayout({ ...layout, company_address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="Addis Ababa, Ethiopia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Phone</label>
              <input
                type="text"
                value={layout.company_phone}
                onChange={(e) => setLayout({ ...layout, company_phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="+251 911 234 567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Email</label>
              <input
                type="email"
                value={layout.company_email}
                onChange={(e) => setLayout({ ...layout, company_email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="contact@stylebadge.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website URL</label>
              <input
                type="text"
                value={layout.website_url}
                onChange={(e) => setLayout({ ...layout, website_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="https://stylebadge.com"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Social Media Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <input
                type="text"
                value={layout.social_facebook}
                onChange={(e) => setLayout({ ...layout, social_facebook: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="https://facebook.com/stylebadge"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                type="text"
                value={layout.social_instagram}
                onChange={(e) => setLayout({ ...layout, social_instagram: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="https://instagram.com/stylebadge"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Twitter</label>
              <input
                type="text"
                value={layout.social_twitter}
                onChange={(e) => setLayout({ ...layout, social_twitter: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="https://twitter.com/stylebadge"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailLayoutSettings;