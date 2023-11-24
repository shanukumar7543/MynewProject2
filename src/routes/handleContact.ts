import { Router } from 'express';

import api from '../api/handleContact';

const contactRoute: Router = Router();

contactRoute.get('/getAll', api.getContact);
contactRoute.get('/get/:id?', api.getContactById);
contactRoute.post('/add', api.createContact);
contactRoute.put('/edit/:id?', api.updateContact);
contactRoute.delete('/remove/:id?', api.delContact);
contactRoute.post('/funnelcontact', api.createContactByFunnel);

export default contactRoute;
