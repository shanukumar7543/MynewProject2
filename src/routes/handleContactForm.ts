import { Router } from 'express';

import api from '../api/handleContactForm';

const contactFormRoute: Router = Router();

contactFormRoute.post('/create', api.createContactForm);
contactFormRoute.get('/get/:id?', api.getContactFormById);
contactFormRoute.put('/update/:id?', api.updateContactForm);
contactFormRoute.put('/remove/:id?', api.removeContactFormData);

export default contactFormRoute;
