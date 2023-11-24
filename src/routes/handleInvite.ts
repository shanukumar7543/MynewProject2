import { Router } from 'express';

import { verifyJWT } from '@/middlewares/authMiddleware';

import api from '../api/handleInvite';

const inviteRoute: Router = Router();

inviteRoute.get('/gotosignup', api.goToSignUp);
inviteRoute.get('/getAll', verifyJWT, api.getInvite);
inviteRoute.get('/get/:id?', verifyJWT, api.getInviteById);
inviteRoute.delete('/delete/:id?', verifyJWT, api.deleteInvite);
inviteRoute.post('/send', verifyJWT, api.sendInvites);
inviteRoute.post('/accept/:id?', verifyJWT, api.acceptInvite);
inviteRoute.put('/update', verifyJWT, api.updateInvite);
inviteRoute.put('/update/role', verifyJWT, api.updateInviteRole);

export default inviteRoute;
