import app from '../../server.ts';

export default function handler(req: any, res: any) {
  req.url = '/api/ai/enhance-prompt';
  return app(req, res);
}
