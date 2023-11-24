import { Router } from 'express';

import api from '../../api/answers/openEnded';

const openEndedRoute: Router = Router();

openEndedRoute.post('/addChoice', api.addChoice);
openEndedRoute.post('/deleteChoice', api.deleteChoice);

export default openEndedRoute;
