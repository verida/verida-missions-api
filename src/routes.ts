import express from 'express';
import Controller from './controller';

const router = express.Router()
router.post(/add/, Controller.add)

export default router