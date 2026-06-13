import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

interface OrphanedFile {
  filename: string;
  path: string;
  size: number;
  size_mb: number;
  modified: string;
}

interface ExpiredOtp {
  id: number;
  admin_id: number;
  otp: string;
  expires_at: string;
  created_at: string;
  used: number;
  minutes_old: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

const SystemSettings: React.FC = () => {
  // Image cleanup states
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // OTP cleanup states
  const [otpScanning, setOtpScanning] = useState(false);
  const [otpCleaning, setOtpCleaning] = useState(false);
  const [otpScanResult, setOtpScanResult] = useState<any>(null);
  const [showOtpDetails, setShowOtpDetails] = useState(false);
  const [otpHoursThreshold, setOtpHoursThreshold] = useState(1);

  // Auto-dismiss message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ==================== Image Cleanup Functions ====================
  const handleImageScan = async () => {
    setScanning(true);
    setMessage(null);
    setScanResult(null);
    
    try {
      const result = await adminService.scanOrphanedImages() as ApiResponse<any>;
      if (result.success && result.data) {
        setScanResult(result.data);
        if (result.data.has_orphaned_files) {
          setMessage({ 
            type: 'success', 
            text: `Scan complete! Found ${result.data.orphaned_files_count} orphaned image files (${result.data.orphaned_files_size_mb} MB).` 
          });
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Scan complete! No orphaned files found. Your storage is clean.' 
          });
        }
      } else {
        setMessage({ type: 'error', text: result.message || 'Scan failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setScanning(false);
    }
  };

  const handleImageCleanup = async () => {
    if (!window.confirm(`Delete ${scanResult?.orphaned_files_count} orphaned image files (${scanResult?.orphaned_files_size_mb} MB)? This action cannot be undone.`)) {
      return;
    }
    
    setCleaning(true);
    setMessage(null);
    
    try {
      const result = await adminService.deleteOrphanedImages() as ApiResponse<any>;
      if (result.success && result.data) {
        setMessage({ 
          type: 'success', 
          text: `Cleanup completed! Deleted ${result.data.orphaned_files_deleted} orphaned files. Freed ${result.data.freed_space_mb} MB of disk space.` 
        });
        setScanResult(null);
      } else {
        setMessage({ type: 'error', text: result.message || 'Cleanup failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setCleaning(false);
    }
  };

  // ==================== OTP Cleanup Functions ====================
  const handleOtpScan = async () => {
    setOtpScanning(true);
    setMessage(null);
    setOtpScanResult(null);
    
    try {
      const result = await adminService.scanExpiredOtps(otpHoursThreshold) as ApiResponse<any>;
      if (result.success && result.data) {
        setOtpScanResult(result.data);
        if (result.data.has_expired) {
          setMessage({ 
            type: 'success', 
            text: `OTP scan complete! Found ${result.data.expired_count} expired OTP records.` 
          });
        } else {
          setMessage({ 
            type: 'success', 
            text: 'OTP scan complete! No expired OTPs found.' 
          });
        }
      } else {
        setMessage({ type: 'error', text: result.message || 'OTP scan failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setOtpScanning(false);
    }
  };

  const handleOtpCleanup = async () => {
    if (!window.confirm(`Delete ${otpScanResult?.expired_count} expired OTP records? This action cannot be undone.`)) {
      return;
    }
    
    setOtpCleaning(true);
    setMessage(null);
    
    try {
      const result = await adminService.deleteExpiredOtps(otpHoursThreshold) as ApiResponse<any>;
      if (result.success && result.data) {
        setMessage({ 
          type: 'success', 
          text: `OTP cleanup completed! Deleted ${result.data.deleted_count} expired OTP records.` 
        });
        setOtpScanResult(null);
      } else {
        setMessage({ type: 'error', text: result.message || 'OTP cleanup failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setOtpCleaning(false);
    }
  };

  return (
    <div className="space-y-6 mt-14">
      <div>
        <h1 className="text-2xl font-bold text-green">System <span className="text-green">Settings</span></h1>
        <p className="text-gray-500 text-sm">Manage system maintenance and cleanup tasks</p>
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

      {/* Orphaned Images Cleanup */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-orange">Orphaned Images <span className='text-royal-blue'>Cleanup</span></h2>
        <p className="text-sm text-gray-600 mb-4">
          Find and delete image files that are no longer associated with any product.
          This helps free up disk space and keep your storage organized.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={handleImageScan}
            disabled={scanning || cleaning}
            className="px-4 py-2 text-gradient-secondary rounded-lg hover:bg-royal-blue-dark hover-lift disabled:opacity-50"
          >
            {scanning ? 'Scanning...' : 'Scan for Orphaned Images'}
          </button>
          
          {scanResult && scanResult.has_orphaned_files && (
            <button
              onClick={handleImageCleanup}
              disabled={cleaning || scanning}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {cleaning ? 'Deleting...' : `Delete ${scanResult.orphaned_files_count} Orphaned Files`}
            </button>
          )}
        </div>
        
        {/* Image Scan Results */}
        {scanResult && (
          <div className="mt-4 border rounded-lg overflow-hidden">
            <div 
              className="px-4 py-2 bg-gray-50 cursor-pointer flex justify-between items-center"
              onClick={() => setShowDetails(!showDetails)}
            >
              <span className="font-medium">Scan Results</span>
              <span>{showDetails ? '▼' : '▶'}</span>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total files scanned:</span>
                  <span className="ml-2 font-medium">{scanResult.total_files_scanned}</span>
                </div>
                <div>
                  <span className="text-gray-500">Database images:</span>
                  <span className="ml-2 font-medium">{scanResult.database_images_count}</span>
                </div>
                <div>
                  <span className="text-gray-500">Orphaned files found:</span>
                  <span className={`ml-2 font-medium ${scanResult.has_orphaned_files ? 'text-red-600' : 'text-green-600'}`}>
                    {scanResult.orphaned_files_count}
                  </span>
                </div>
                {scanResult.has_orphaned_files && (
                  <div>
                    <span className="text-gray-500">Total size to free:</span>
                    <span className="ml-2 font-medium text-orange-600">{scanResult.orphaned_files_size_mb} MB</span>
                  </div>
                )}
              </div>
              
              {showDetails && scanResult.orphaned_files && scanResult.orphaned_files.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-2">Orphaned Files List:</h4>
                  <div className="max-h-60 overflow-y-auto bg-gray-50 rounded p-2">
                    <table className="w-full text-xs">
                      <thead className="text-gray-500">
                        <tr>
                          <th className="text-left py-1">Filename</th>
                          <th className="text-left py-1">Size</th>
                          <th className="text-left py-1">Modified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scanResult.orphaned_files.map((file: any, idx: number) => (
                          <tr key={idx} className="border-t border-gray-200">
                            <td className="py-1 font-mono">{file.filename}</td>
                            <td className="py-1">{file.size_mb} MB</td>
                            <td className="py-1">{file.modified}</td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {!scanResult.has_orphaned_files && (
                <div className="text-green-600 text-sm">
                  ✓ Your storage is clean! No orphaned files found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* OTP Cleanup */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-magenta">Expired OTP <span className='text-royal-blue'>Cleanup</span></h2>
        <p className="text-sm text-gray-600 mb-4">
          Find and delete expired OTP records from the database. OTPs older than the specified threshold will be removed.
          This helps keep your database clean and optimized.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Cleanup threshold (hours):</label>
          <select
            value={otpHoursThreshold}
            onChange={(e) => setOtpHoursThreshold(parseInt(e.target.value))}
            className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
          >
            <option value="1">1 hour</option>
            <option value="6">6 hours</option>
            <option value="12">12 hours</option>
            <option value="24">24 hours</option>
            <option value="48">48 hours</option>
            <option value="168">7 days</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Delete OTPs older than this threshold (based on creation time)
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleOtpScan}
            disabled={otpScanning || otpCleaning}
            className="px-4 py-2 text-gradient-secondary hover-lift rounded-lg hover:bg-royal-blue-dark disabled:opacity-50"
          >
            {otpScanning ? 'Scanning...' : 'Scan for Expired OTPs'}
          </button>
          
          {otpScanResult && otpScanResult.has_expired && (
            <button
              onClick={handleOtpCleanup}
              disabled={otpCleaning || otpScanning}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {otpCleaning ? 'Deleting...' : `Delete ${otpScanResult.expired_count} Expired OTPs`}
            </button>
          )}
        </div>
        
        {/* OTP Scan Results */}
        {otpScanResult && (
          <div className="mt-4 border rounded-lg overflow-hidden">
            <div 
              className="px-4 py-2 bg-gray-50 cursor-pointer flex justify-between items-center"
              onClick={() => setShowOtpDetails(!showOtpDetails)}
            >
              <span className="font-medium">OTP Statistics & Results</span>
              <span>{showOtpDetails ? '▼' : '▶'}</span>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total OTPs in database:</span>
                  <span className="ml-2 font-medium">{otpScanResult.stats?.total_otps || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Used OTPs:</span>
                  <span className="ml-2 font-medium">{otpScanResult.stats?.used_count || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Active (valid) OTPs:</span>
                  <span className="ml-2 font-medium text-green-600">{otpScanResult.stats?.active_count || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Expired OTPs found:</span>
                  <span className={`ml-2 font-medium ${otpScanResult.has_expired ? 'text-red-600' : 'text-green-600'}`}>
                    {otpScanResult.expired_count}
                  </span>
                </div>
                {otpScanResult.stats?.oldest_otp && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Oldest OTP:</span>
                    <span className="ml-2 font-medium">{new Date(otpScanResult.stats.oldest_otp).toLocaleString()}</span>
                  </div>
                )}
                {otpScanResult.stats?.newest_otp && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Newest OTP:</span>
                    <span className="ml-2 font-medium">{new Date(otpScanResult.stats.newest_otp).toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              {showOtpDetails && otpScanResult.expired_otps && otpScanResult.expired_otps.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-2">Expired OTPs List:</h4>
                  <div className="max-h-60 overflow-y-auto bg-gray-50 rounded p-2">
                    <table className="w-full text-xs">
                      <thead className="text-gray-500">
                        <tr>
                          <th className="text-left py-1">ID</th>
                          <th className="text-left py-1">Admin ID</th>
                          <th className="text-left py-1">OTP</th>
                          <th className="text-left py-1">Created</th>
                          <th className="text-left py-1">Minutes Old</th>
                          <th className="text-left py-1">Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {otpScanResult.expired_otps.map((otp: any, idx: number) => (
                          <tr key={idx} className="border-t border-gray-200">
                            <td className="py-1">{otp.id}</td>
                            <td className="py-1">{otp.admin_id}</td>
                            <td className="py-1 font-mono">{otp.otp}</td>
                            <td className="py-1">{new Date(otp.created_at).toLocaleString()}</td>
                            <td className="py-1">{otp.minutes_old} min</td>
                            <td className="py-1">{otp.used ? 'Yes' : 'No'}</td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {!otpScanResult.has_expired && (
                <div className="text-green-600 text-sm">
                  ✓ No expired OTPs found! Your OTP table is clean.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;