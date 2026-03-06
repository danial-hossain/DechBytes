import express from 'express';
import auth from '../middlewares/auth.js';
import {
    initiatePayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    paymentIpn,
    getOrderDetails
} from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/initiate', auth, initiatePayment);
router.post('/success/:tran_id', paymentSuccess);
router.post('/fail/:tran_id', paymentFail);
router.post('/cancel/:tran_id', paymentCancel);
router.post('/ipn', paymentIpn);
router.get('/order/:tran_id', auth, getOrderDetails);

export default router;