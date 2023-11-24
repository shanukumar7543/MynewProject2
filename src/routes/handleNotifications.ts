import { Router } from 'express';

import api from '../api/handleNotifications';

const notificationRoute: Router = Router();

notificationRoute.post('/update/:id?', api.updateNotification);
notificationRoute.get('/getnotification/:id?', api.getNotificationsFromUserId);

export default notificationRoute;
