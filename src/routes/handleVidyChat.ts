import { Router } from 'express';

import api from '../api/handleVidyChat';

const vidyChatRoute: Router = Router();

vidyChatRoute.post('/create', api.createVidyChat);
vidyChatRoute.get(
  '/getStepsWithAnswers/:id?',
  api.getVidychatWithStepsAndAnswers
);
vidyChatRoute.get('/get/:id?', api.getVidychatById);
vidyChatRoute.get('/getAll', api.getAllVidyChats);
vidyChatRoute.put('/updatevidychat/:id?', api.updateVidyChat);

vidyChatRoute.get('/vidychatcount', api.getVidychat);

// vidyChatRoute.put('/update/:id?', api.updateUser);
// vidyChatRoute.post('/get/:id?', api.getUser);
// vidyChatRoute.post('/getuserorgs', api.getUserOrganizations);

export default vidyChatRoute;
