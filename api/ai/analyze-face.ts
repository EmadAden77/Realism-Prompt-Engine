import app from '../../server.ts';

export default function handler(req: any, res: any) {
  req.url = '/api/ai/analyze-face';
  return app(req, res);
}
