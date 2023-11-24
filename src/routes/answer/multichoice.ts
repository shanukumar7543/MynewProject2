import { Router } from 'express';

import api from '../../api/answers/multichoice';

const multiChoiceRoute: Router = Router();

multiChoiceRoute.post('/addChoice', api.addChoice);
multiChoiceRoute.post('/updateChoice', api.updateChoice);
multiChoiceRoute.post('/deleteChoice', api.deleteChoice);
multiChoiceRoute.post('/create', api.createAnswer);

// inviteRoute.get('/getAll', api.getAllInvites);
// inviteRoute.delete('/delete/:id?', api.deleteInvite);
// inviteRoute.post('/send', api.sendInvites);
// inviteRoute.post('/accept/:id?', api.acceptInvite);

export default multiChoiceRoute;
