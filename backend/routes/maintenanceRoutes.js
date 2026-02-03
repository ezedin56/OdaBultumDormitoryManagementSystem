const express = require('express');
const router = express.Router();
const { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest, getMyRequests, getMaintenanceStats, deleteMaintenanceRequest } = require('../controllers/maintenanceController');

router.route('/').get(getMaintenanceRequests).post(createMaintenanceRequest);
router.route('/my-requests').get(getMyRequests);
router.route('/stats').get(getMaintenanceStats);
router.route('/:id').put(updateMaintenanceRequest).delete(deleteMaintenanceRequest);

module.exports = router;
