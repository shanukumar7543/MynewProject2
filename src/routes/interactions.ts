import { Router } from 'express';

import {
  deleteInteraction,
  getAllInteractions,
  getInteraction,
} from '@/api/handleInteractions';

const interactionRoute: Router = Router();

interactionRoute.get('/getAll', getAllInteractions);
interactionRoute.delete('/delete', deleteInteraction);
interactionRoute.get('/:id', getInteraction);

export default interactionRoute;
