import app from '../../server.ts';

export default function handler(req: any, res: any) {
  req.url = '/api/ai/audit-realism';
  return app(req, res);
}
