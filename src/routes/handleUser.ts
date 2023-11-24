import { Router } from 'express';

import api from '../api/handleUser';

const userRoute: Router = Router();

userRoute.get('/getAll', api.getAllUsers);
userRoute.get('/getusercount', api.getUserCount);
userRoute.get('/getUser', api.getUserById);
userRoute.put('/update/:id?', api.updateUser);
userRoute.post('/get/:id?', api.getUser);
userRoute.post('/getuserorgs', api.getUserOrganizations);

export default userRoute;
