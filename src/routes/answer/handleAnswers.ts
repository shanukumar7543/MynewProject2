import { Router } from 'express';

import api from '../../api/answers/handleAnswers';

const answersRoute: Router = Router();

answersRoute.post('/add', api.addAnswer);
answersRoute.post('/update', api.updateAnswers);

export default answersRoute;
