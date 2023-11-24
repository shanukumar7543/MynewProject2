import { Router } from 'express';

import api from '../api/handleSteps';

const stepsRoute: Router = Router();

stepsRoute.post('/add', api.addStep);
stepsRoute.post('/getAll', api.getAllStep);
stepsRoute.post('/get', api.getStepById);
stepsRoute.put('/update/:id', api.updateStep);
stepsRoute.post('/delete', api.deleteStep);
stepsRoute.post('/user/getAll', api.getAllStepsOfUser);
stepsRoute.post('/updatebulkpositions', api.updateBulkPositionOfSteps);

// vidyChatRoute.get('/getAll', api.getAllUsers);
// vidyChatRoute.put('/update/:id?', api.updateUser);
// vidyChatRoute.post('/get/:id?', api.getUser);
// vidyChatRoute.post('/getuserorgs', api.getUserOrganizations);

export default stepsRoute;
