const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authAdmin = require('../middleware/authAdmin');

const guard = authAdmin(); // any admin role
const superOnly = authAdmin(['super_admin']);

// ─── Admin Auth (no guard — these set/clear the cookie) ──────────
router.post('/login',  adminController.adminLogin);
router.post('/logout', adminController.adminLogout);
router.get('/me',      guard, adminController.adminMe);

// Services
router.get('/services', guard, adminController.listServices);
router.post('/services', guard, adminController.createService);
router.put('/services/:id', guard, adminController.updateService);
router.delete('/services/:id', superOnly, adminController.deleteService);

// Stays
router.get('/stay', guard, adminController.listStay);
router.post('/stay', guard, adminController.createStay);
router.put('/stay/:id', guard, adminController.updateStay);
router.delete('/stay/:id', superOnly, adminController.deleteStay);

// Transport
router.get('/transport', guard, adminController.listTransport);
router.post('/transport', guard, adminController.createTransport);
router.put('/transport/:id', guard, adminController.updateTransport);
router.delete('/transport/:id', superOnly, adminController.deleteTransport);

// Activities
router.get('/activities', guard, adminController.listActivities);
router.post('/activities', guard, adminController.createActivity);
router.put('/activities/:id', guard, adminController.updateActivity);
router.delete('/activities/:id', superOnly, adminController.deleteActivity);

// Affiliations / Partners
router.get('/partners', guard, adminController.listPartners);
router.post('/partners', guard, adminController.createPartner);
router.put('/partners/:id', guard, adminController.updatePartner);
router.delete('/partners/:id', superOnly, adminController.deletePartner);

// Enquiries
router.get('/enquiries', guard, adminController.listEnquiries);
router.put('/enquiries/:id', guard, adminController.updateEnquiry);

// Proposals
router.get('/proposals',                        guard, adminController.listProposals);
router.post('/proposals',                       guard, adminController.createProposal);
router.delete('/proposals/:id',                 guard, adminController.deleteProposal);
router.get('/proposals/:id',                    guard, adminController.getProposal);
router.put('/proposals/:id',                    guard, adminController.updateProposal);
router.post('/proposals/:id/items',             guard, adminController.addProposalItem);
router.put('/proposals/:id/items/:itemId',      guard, adminController.updateProposalItem);
router.delete('/proposals/:id/items/:itemId',   guard, adminController.deleteProposalItem);
router.post('/proposals/:id/convert',           guard, adminController.convertProposalToBooking);
router.post('/proposals/:id/auto-populate',     guard, adminController.autoPopulateProposal);
router.put('/proposals/:id/reorder',            guard, adminController.reorderProposalItems);

// Bookings
router.get('/bookings',        guard, adminController.listBookings);
router.put('/bookings/:id',    guard, adminController.updateBooking);
router.delete('/bookings/:id', guard, adminController.deleteBooking);

// Admin users (super_admin only)
router.get('/users', superOnly, adminController.listAdminUsers);
router.post('/users', superOnly, adminController.createAdminUser);
router.put('/users/:id', superOnly, adminController.updateAdminUser);

module.exports = router;
