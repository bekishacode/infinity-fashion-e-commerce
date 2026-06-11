import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

interface EmailTemplate {
  id: number;
  name: string;
  template_key: string;
  subject: string;
  header: string;
  body: string;
  footer: string;
  variables: string;
  is_active: boolean;
}

interface EmailTemplateEditorProps {
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ template, isOpen, onClose, onSave }) => {
  const [subject, setSubject] = useState('');
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test data for preview
  const testData: Record<string, string> = {
    name: 'John Doe',
    otp: '123456',
    expires_in: '15 minutes',
    order_number: 'ORD-20241225-001',
    customer_name: 'John Doe',
    product_name: 'Custom T-Shirt',
    quantity: '2',
    total_amount: '700.00',
    status: 'Confirmed',
    old_status: 'Pending',
    new_status: 'Confirmed',
    year: new Date().getFullYear().toString(),
    company_name: 'Style Badge'
  };

  useEffect(() => {
    if (template) {
      setSubject(template.subject || '');
      setHeader(template.header || '');
      setBody(template.body || '');
      setFooter(template.footer || '');
      setIsActive(template.is_active);
      if (template.variables) {
        try {
          setVariables(JSON.parse(template.variables));
        } catch (e) {
          setVariables([]);
        }
      }
    }
  }, [template]);

  // Replace variables with test data
  const replaceVariables = (text: string): string => {
    let result = text;
    for (const [key, value] of Object.entries(testData)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  };

  const generatePreviewHtml = () => {
    const replacedHeader = replaceVariables(header);
    const replacedBody = replaceVariables(body);
    const replacedFooter = replaceVariables(footer);
    const replacedSubject = replaceVariables(subject);

    // Get layout settings from parent or use defaults
    const primaryColor = '#273B89';
    const secondaryColor = '#EC2D7B';
    const fontFamily = 'Arial, sans-serif';

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${replacedSubject} - Preview</title>
        <style>
            body {
                font-family: ${fontFamily};
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
            }
            .preview-badge {
                background-color: #f0f0f0;
                text-align: center;
                padding: 8px;
                font-size: 12px;
                color: #666;
                border-bottom: 1px solid #ddd;
            }
        </style>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
            <div class="preview-badge">
                ⚡ PREVIEW MODE - Test data is being used ⚡
            </div>
            ${replacedHeader}
            <div style="padding: 30px;">
                ${replacedBody}
            </div>
            ${replacedFooter}
        </div>
    </body>
    </html>`;
  };

  const handlePreview = () => {
    const html = generatePreviewHtml();
    setPreviewHtml(html);
    setShowPreview(true);
  };

  const handleSave = async () => {
    if (!template) return;
    
    setLoading(true);
    setMessage(null);
    try {
      const result = await adminService.updateEmailTemplateFull(template.id, {
        subject,
        header,
        body,
        footer,
        is_active: isActive
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Template saved successfully!' });
        setTimeout(() => {
          onSave();
          onClose();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save template' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = body;
      const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
      setBody(newText);
      // Focus back on textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 10);
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto mt-14">
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Edit Template: <span className='text-orange'>{template.name}</span></h2>
              <p className="text-sm text-gray-500">{template.template_key}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex justify-between items-center ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="ml-3">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Template Settings */}
            <div className="lg:col-span-2 space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm text-green font-bold mb-1">Email Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  placeholder="Enter email subject"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Preview: <span className="text-royal-blue">{replaceVariables(subject)}</span>
                </p>
              </div>

              {/* Header Section */}
              <div>
                <label className="block text-sm text-magenta font-bold mb-1">Email Header (HTML)</label>
                <textarea
                  rows={6}
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue font-mono text-sm"
                  placeholder="<div style='padding: 20px; background: #f4f4f4;'><h1>Your Logo Here</h1></div>"
                />
                <p className="text-xs text-gray-400 mt-1">HTML allowed. This appears at the top of the email.</p>
              </div>

              {/* Body Section */}
              <div>
                <label className="block text-sm text-green font-bold mb-1">Email Body (HTML) *</label>
                <textarea
                  id="email-body"
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue font-mono text-sm"
                  placeholder="<p>Hello {{customer_name}},</p><p>Your order {{order_number}} has been confirmed.</p>"
                />
              </div>

              {/* Footer Section */}
              <div>
                <label className="block text-sm text-magenta font-bold mb-1">Email Footer (HTML)</label>
                <textarea
                  rows={6}
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue font-mono text-sm"
                  placeholder="<div style='text-align: center; padding: 20px;'>&copy; {{year}} Style Badge</div>"
                />
                <p className="text-xs text-gray-400 mt-1">HTML allowed. This appears at the bottom of the email.</p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Active (email will be sent)</label>
              </div>
            </div>

            {/* Right Column - Variables & Preview */}
            <div className="space-y-4">
              {/* Available Variables */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Available Variables</h3>
                <p className="text-xs text-gray-500 mb-3">Click to insert into email body</p>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <button
                      key={variable}
                      onClick={() => insertVariable(variable)}
                      className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300 transition"
                    >
                      {'{{'}{variable}{'}}'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Variables Example */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Test Values (Preview)</h3>
                <p className="text-xs text-gray-600 mb-2">These values will replace variables in preview:</p>
                <div className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                  {Object.entries(testData).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-blue-100 py-1">
                      <code className="bg-gray-200 px-1 rounded">{'{{'}{key}{'}}'}</code>
                      <span className="text-gray-700">→ {value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Button */}
              <button
                onClick={handlePreview}
                disabled={loading}
                className="w-full bg-royal-blue text-white py-2 rounded-lg hover:bg-royal-blue-dark disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Preview Email'}
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Email Preview</h3>
                <p className="text-xs text-gray-500">Test data is being used to replace variables</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.document.write(previewHtml);
                      newWindow.document.close();
                    }
                  }}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  Open in New Window
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateEditor;