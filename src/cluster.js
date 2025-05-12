import cluster from 'cluster';
import { cpus } from 'os';
import http from 'http';

const PORT = +process.env.WORKER_PORT || 8000;
const numCPUs = cpus().length - 1;

if (cluster.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);

    for (let i = 1; i <= numCPUs; i++) {
        cluster.fork({ WORKER_PORT: PORT + i });
    }

    let currentWorker = 1;

    const loadBalancer = http.createServer((req, res) => {
        const targetPort = PORT + currentWorker;
        const options = {
            hostname: 'localhost',
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: req.headers,
        };

        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        req.pipe(proxyReq, { end: true });

        proxyReq.on('error', () => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        });

        currentWorker = (currentWorker % numCPUs) + 1;
    });

    loadBalancer.listen(PORT, () => {
        console.log(`Load balancer is listening on http://localhost:${PORT}/api`);
    });

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    console.log('process.env.WORKER_PORT', process.env["WORKER_PORT"]);
    const { WORKER_PORT } = process.env;
    const { requestListener } = await import('./requestListener.js');
    const server = http.createServer(requestListener);
    server.listen(WORKER_PORT, () => {
        console.log(`Worker ${process.pid} is listening on http://localhost:${WORKER_PORT}/api`);
    });
}