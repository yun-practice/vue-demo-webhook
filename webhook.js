let http = require('http');

let server = http.createServer((req, res) => {
    console.log(req.method, req.url);
    if (req.method == 'post' && req.url == '/webhook') {
        // 给github服务器发一个回应
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
    } else {
        res.end('Not Found');
    }
});

server.listen(5000, () => {
    console.log('服务已经在5000端口上启动了');
});
