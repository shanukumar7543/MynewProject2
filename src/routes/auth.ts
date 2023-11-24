import { Router } from 'express';

import api from '../api/auth';

const authRoute: Router = Router();

authRoute.post('/register', api.register);
authRoute.post('/login', api.login);
authRoute.post('/adminlogin', api.SuperAdminlogin);
authRoute.post('/send-otp', api.sendOtp);
authRoute.post('/verify-otp', api.verifyOtp);
authRoute.post('/intiate-reset-password', api.sendPasswordResetEmail);
authRoute.post('/reset-password', api.resetPassword);
authRoute.post('/resend-email', api.resendEmail);
authRoute.post('/verify', api.verifyemail);

export default authRoute;
