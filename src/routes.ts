import express from 'express';
import Controller from './controller';
import UtilsController from './utils-controller';

const router = express.Router()

const utilsController = new UtilsController();


router.get("/_health", (req, res) => utilsController.getHealth(req, res));
router.get("/_version", (req, res) => utilsController.getVersion(req, res));

router.get(/^\/network\/(.*)\/stats$/, Controller.stats)
router.get(/^\/$/, Controller.home)

// /<did>/<contextName>/<databaseName>/<recordId>/<attribute>/<...deepAttributes>
router.get(/(did\:.*)$/, Controller.getData)

router.get(/^\/ipfs\/(.*)/, Controller.getIPFS)

// /<base58EncodedVeridaUri>
// @see @verida/helpers Utils.encodeUri()
router.get(/^\/(.*)?$/, Controller.getUri)



export default router