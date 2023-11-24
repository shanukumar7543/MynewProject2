import { Router } from 'express';

import api from '../../api/answers/button';

const buttonRoute: Router = Router();

buttonRoute.post('/create', api.createAnswer);

// inviteRoute.get('/getAll', api.getAllInvites);
// inviteRoute.delete('/delete/:id?', api.deleteInvite);
// inviteRoute.post('/send', api.sendInvites);
// inviteRoute.post('/accept/:id?', api.acceptInvite);

export default buttonRoute;
