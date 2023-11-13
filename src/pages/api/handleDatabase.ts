import type { NextApiRequest, NextApiResponse } from 'next';
import { resetDBController } from '@/controllers/DBController';
import CookiesAdapter from '@/lib/cookiesAdapter';
import { USER_HASH_NAME } from '@/database/DBHandler/DBState';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const cookies = new CookiesAdapter(req, res);
    switch (req.method) {
        case 'GET': {
            const browserHash = cookies.get(USER_HASH_NAME);
            const resetDBControllerResponse = await resetDBController(
                browserHash,
            );
            if (!resetDBControllerResponse.success)
                return res.status(500).json(resetDBControllerResponse);
            return res.status(200).json(resetDBControllerResponse);
        }
        default: {
            return res
                .status(405)
                .json({ success: false, data: 'Method Not Allowed' });
        }
    }
}
