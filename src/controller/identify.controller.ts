import { Request, Response } from "express";
import contactService from "../service/contact.service";

export const identify = async (req: Request, res: Response) => {
    const email = req.body.email as string | undefined;
    const phoneNumber = req.body.phoneNumber as string | undefined;

    const response = await contactService.identityReconciliation({ email, phoneNumber });

    return res.status(200).json(response);
};