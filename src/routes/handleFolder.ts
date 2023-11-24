import { Router } from 'express';

import api from '../api/handleNewFolder';

const folderRoute: Router = Router();

folderRoute.get('/getAll', api.getFolder);
folderRoute.get('/get/:id?', api.getFolderById);
folderRoute.post('/add', api.createFolder);
folderRoute.put('/edit/:id?', api.updateFolder);
folderRoute.delete('/remove/:id?', api.delFolder);
folderRoute.get('/getDefault', api.getDefaultFolder);

export default folderRoute;
