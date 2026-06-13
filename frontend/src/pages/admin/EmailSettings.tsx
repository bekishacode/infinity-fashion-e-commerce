import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import EmailTemplateEditor from '../../components/admin/EmailTemplateEditor';

// API interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Also add interface for email config
interface EmailConfigData {
  config: {
    provider?: string;
    smtp_host?: string;
    smtp_port?: number;
    smtp_username?: string;
    smtp_encryption?: string;
    from_email?: string;
    from_name?: string;
  };
  templates?: any[];
}

const EmailSettings: React.FC = () => {
  const [config, setConfig] = useState({
    provider: 'smtp',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    from_email: '',
    from_name: 'Style Badge'
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Auto-dismiss message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    setLoading(true);
    try {
      const result = await adminService.getEmailConfig() as ApiResponse<EmailConfigData>;
      if (result.success && result.data) {
        if (result.data.config) {
          setConfig({
            provider: result.data.config.provider || 'smtp',
            smtp_host: result.data.config.smtp_host || 'smtp.gmail.com',
            smtp_port: result.data.config.smtp_port || 587,
            smtp_username: result.data.config.smtp_username || '',
            smtp_password: '',
            smtp_encryption: result.data.config.smtp_encryption || 'tls',
            from_email: result.data.config.from_email || '',
            from_name: result.data.config.from_name || 'Style Badge'
          });
        }
        setTemplates(result.data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching email config:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const result = await adminService.updateEmailConfig(config);
      if (result.success) {
        showMessage('success', 'Email configuration saved successfully!');
        setIsEditing(false);
        setConfig(prev => ({ ...prev, smtp_password: '' }));
      } else {
        showMessage('error', result.message || 'Failed to save configuration');
      }
    } catch (error) {
      showMessage('error', 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    fetchEmailConfig();
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    
    setSaving(true);
    try {
      const result = await adminService.updateEmailTemplate(selectedTemplate.id, {
        subject: selectedTemplate.subject,
        body: selectedTemplate.body,
        is_active: selectedTemplate.is_active
      });
      
      if (result.success) {
        showMessage('success', 'Template updated successfully!');
        fetchEmailConfig();
        setShowTemplateEditor(false);
        setSelectedTemplate(null);
      } else {
        showMessage('error', result.message || 'Failed to update template');
      }
    } catch (error) {
      showMessage('error', 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      showMessage('error', 'Please enter a test email address');
      return;
    }
    
    setSendingTest(true);
    try {
      const result = await adminService.testEmail(testEmail);
      if (result.success) {
        showMessage('success', `Test email sent to ${testEmail}!`);
      } else {
        showMessage('error', result.message || 'Failed to send test email');
      }
    } catch (error) {
      showMessage('error', 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const editTemplate = async (template: any) => {
    try {
      const result = await adminService.getEmailTemplateFull(template.id) as ApiResponse<any>;
      if (result.success && result.data) {
        setSelectedTemplate(result.data);
        setShowTemplateEditor(true);
      } else {
        showMessage('error', 'Failed to load template details');
      }
    } catch (error) {
      showMessage('error', 'Something went wrong');
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
    <div className="space-y-6 mt-16">
      <div>
        <h1 className="text-2xl font-bold text-magenta">Email <span className="text-royal-blue">Settings</span></h1>
        <p className="text-gray-500 text-sm">Configure email provider and manage email templates</p>
      </div>

      {/* Auto-dismissible Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm flex justify-between items-center ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-3 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMTP Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">SMTP Configuration</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-royal-blue hover:text-royal-blue-dark text-sm font-medium"
              >
                Edit Settings
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">From Email *</label>
                <input
                  type="email"
                  value={config.from_email}
                  onChange={(e) => setConfig({ ...config, from_email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  placeholder="noreply@yourdomain.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">From Name *</label>
                <input
                  type="text"
                  value={config.from_name}
                  onChange={(e) => setConfig({ ...config, from_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  placeholder="Style Badge"
                  required
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">SMTP Server Settings</h3>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={config.smtp_host}
                    onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Port</label>
                    <input
                      type="number"
                      value={config.smtp_port}
                      onChange={(e) => setConfig({ ...config, smtp_port: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Encryption</label>
                    <select
                      value={config.smtp_encryption}
                      onChange={(e) => setConfig({ ...config, smtp_encryption: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={config.smtp_username}
                    onChange={(e) => setConfig({ ...config, smtp_username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">App Password</label>
                  <input
                    type="password"
                    value={config.smtp_password}
                    onChange={(e) => setConfig({ ...config, smtp_password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    placeholder="Enter app password"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    For Gmail, use an <strong>App Password</strong> (16 characters, no spaces)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 text-gradient-primary py-2 rounded-lg hover:bg-royal-blue-dark disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-gray-500">From Email:</p>
                <p className="text-sm font-medium">{config.from_email || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-gray-500">From Name:</p>
                <p className="text-sm font-medium">{config.from_name || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-gray-500">SMTP Host:</p>
                <p className="text-sm font-medium">{config.smtp_host || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-gray-500">SMTP Port:</p>
                <p className="text-sm font-medium">{config.smtp_port || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-gray-500">Username:</p>
                <p className="text-sm font-medium">{config.smtp_username || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-gray-500">Encryption:</p>
                <p className="text-sm font-medium">{config.smtp_encryption || '—'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Test Email */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg text-royal-blue font-semibold mb-4">Test Email</h2>
            <p className="text-sm text-gray-500 mb-4">
              Send a test email to verify your SMTP configuration.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
              />
              <button
                onClick={handleTestEmail}
                disabled={sendingTest}
                className="px-4 py-2 text-gradient-secondary hover-lift rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {sendingTest ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">📧 Gmail Setup Guide</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">1. Go to Google Account → Security</p>
              <p className="text-gray-600">2. Enable 2-Step Verification</p>
              <p className="text-gray-600">3. Generate App Password (select "Mail")</p>
              <p className="text-gray-600">4. Copy the 16-character password</p>
              <p className="text-gray-600 mt-2 font-medium">Settings to use:</p>
              <p className="text-gray-600 text-xs">SMTP: smtp.gmail.com | Port: 587 | TLS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Templates Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg text-orange font-semibold mb-4">Email Templates</h2>
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full">
            <thead className="bg-green-light">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-magenta uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-royal-blue">{template.name}</p>
                      <p className="text-xs text-gray-400">{template.template_key}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{template.subject}</td>
                  <td className="px-4 py-3">
                    {template.is_active ? (
                      <span className="text-green-600 bg-green-light rounded-lg p-1 text-sm">Active</span>
                    ) : (
                      <span className="text-red-600 text-sm">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => editTemplate(template)}
                      className="text-royal-blue hover:text-royal-blue-dark text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Template Editor Modal */}
      
      {showTemplateEditor && selectedTemplate && (
        <EmailTemplateEditor
            template={selectedTemplate}
            isOpen={showTemplateEditor}
            onClose={() => {
            setShowTemplateEditor(false);
            setSelectedTemplate(null);
            }}
            onSave={() => {
            fetchEmailConfig();
            showMessage('success', 'Template updated successfully');
            }}
        />
      )}
    </div>
  );
};

export default EmailSettings;