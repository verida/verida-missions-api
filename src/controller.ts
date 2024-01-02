import { Request, Response } from 'express'
import { Network } from '@verida/client-ts'
import { encodeUri } from '@verida/helpers'
import { activeDIDCount } from '@verida/vda-did-resolver'

export default class Controller {

    public static async getData(req: Request, res: Response) {
        const veridaUri = `verida://${req.params[0]}`
        console.log(veridaUri)
        console.log(encodeUri(veridaUri))

        try {
            const data = await Network.getRecord(veridaUri, false)
            return Controller.buildAttributeResult(res, data)
        } catch (err: any) {
            return res.status(400).send({
                status: "fail",
                message: err.message
            })
        }
    }

    private static async buildAttributeResult(res: Response, data: any) {
        if (typeof data === 'string') {
            // Detect Base64 image
            const base64ImageMatch = data.match(/^data:(image\/[^/]*);base64,(.*)/)
            if (base64ImageMatch) {
                const contentType = base64ImageMatch[1]
                const imgData = base64ImageMatch[2]
                const img = Buffer.from(imgData, 'base64');

                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Length': img.length
                });

                return res.end(img)
            }
        }

        // Default to JSON response
        console.log('setting header')
        res.setHeader('Content-Type', 'application/json')
        return res.status(200).send(data)
    }

    public static async getUri(req: Request, res: Response) {
        const reqParam = req.params[0]
        const params: any = reqParam.split('.')
        const encodedVeridaUri = params[0]
        
        try {
            const record = await Network.getRecord(encodedVeridaUri, true)
            return res.status(200).send(record)
        } catch (err: any) {
            if (err.message == 'Non-base58 character') {
                return res.status(400).send({
                    status: "fail",
                    message: `Invalid encoded Verida URI (Non-base58)`
                })
            }
        }
    }

    public static async getIPFS(req: Request, res: Response) {
        const ipfsHash = req.params[0]
        const redirectUrl = `https://gateway.moralisipfs.com/ipfs/${ipfsHash}`

        return res.redirect(redirectUrl)
    }

    public static async stats(req: Request, res: Response) {
        const network = req.params[0]

        try {
            const count = await activeDIDCount(network)

            return res.status(200).send({
                activeDIDs: count
            })
        } catch(err: any) {
            return res.status(400).send({
                status: "fail",
                message: `Error: ${err.message}`
            })
        }
    }

    public static async home(req: Request, res: Response) {
        return res.status(200).send({
            status: "ok"
        })
    }
}