import app from '../../server.ts';

export default function handler(req: any, res: any) {
  req.url = '/api/ai/direct-scene';
  return app(req, res);
}
