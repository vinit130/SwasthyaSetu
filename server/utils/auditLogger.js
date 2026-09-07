const mongoose = require('mongoose');

/**
 * Logs a security or clinical action to AuditLog collection and in-memory mock store
 * @param {object} req - Express request object
 * @param {object} params - Audit log parameters
 */
async function logAudit(req, {
  action,
  resourceType,
  resourceId = null,
  facilityId = null,
  district = null,
  status = 'SUCCESS',
  details = '',
}) {
  try {
    const actorUserId = req.user?._id || req.user?.id || null;
    const actorName = req.user?.name || 'Anonymous / System';
    const actorRole = req.user?.role || 'ANONYMOUS';

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const auditEntry = {
      actorUserId,
      actorName,
      actorRole,
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : null,
      facilityId: facilityId ? String(facilityId) : null,
      district,
      status,
      details: typeof details === 'object' ? JSON.stringify(details) : String(details),
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    // 1. If MongoDB is connected, save to DB
    if (mongoose.connection.readyState === 1) {
      try {
        const AuditLog = mongoose.model('AuditLog');
        if (AuditLog) {
          await AuditLog.create({
            ...auditEntry,
            timestamp: new Date(),
          });
        }
      } catch (dbErr) {
        // Continue to mockStore fallback
      }
    }

    // 2. Always record in mockStore in-memory buffer
    try {
      const mockStore = require('./mockStore');
      if (mockStore && mockStore.auditLogs) {
        mockStore.auditLogs.unshift({
          _id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          ...auditEntry,
        });
        if (mockStore.auditLogs.length > 500) {
          mockStore.auditLogs.pop();
        }
      }
    } catch (mockErr) {
      // Best-effort logging
    }
  } catch (err) {
    console.error('[AuditLogger] Error writing audit record:', err.message);
  }
}

module.exports = { logAudit };
