import { Router } from 'express';

import api from '../api/handleOrganization';

const organizationRoute: Router = Router();

organizationRoute.post('/add', api.addOrganization);
organizationRoute.get('/getorgcount', api.getOrg);
organizationRoute.put('/edit', api.editOrganization);
organizationRoute.post('/get/:id?', api.getOrganization);
organizationRoute.post('/addMember/:id?', api.addMemberToOrganization);
organizationRoute.post('/getAllMembers/:id?', api.getOrganizationMembers);
organizationRoute.delete(
  '/removeMember/:id?',
  api.removeMemberFromOrganization
);
organizationRoute.get('/organizationsstats', api.getAllOrganizationsWithStats);

// routes for brand management
organizationRoute.post('/brand/add', api.createBrand);
organizationRoute.get('/brand/getAll/:organizationId', api.getBrands);
organizationRoute.get('/brand/:id', api.getBrandById);
organizationRoute.put('/brand/:id', api.updateBrandById);
organizationRoute.delete('/brand/:id', api.deleteBrandById);

export default organizationRoute;
