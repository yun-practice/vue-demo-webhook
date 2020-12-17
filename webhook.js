let http = require('http');
let crypto = require('crypto');
let SECRET = '123456'; // 跟github webhooks中的秘钥一样
function sign(body) {
    // crypto.createHmac(名字, 秘钥), update()里面放入你要加密的文本, digest()里面放入16进制字符串 hex编码
    return `sha1=` + crypto.createHmac('sh1', SECRET).update(body).digest('hex');
}

let server = http.createServer((req, res) => {
    console.log(req.method, req.url);
    if (req.method == 'post' && req.url == '/webhook') {
        let buffers = [];
        req.on('data', (buffer) => {
            buffers.push(buffer);
        });
        req.on('end', (buffer) => {
            let body = Buffer.concat(buffers);
            let event = req.header['X-gitHub-event']; // event = push
            // github请求过来的时候,要传递请求体body,另外还会传一个signature，你需要验证签名对不对
            let signature = req.headers['x-hub-signature'];
            if (signature !== sign(body)) {
                return res.end('Not Found');
            }
        });
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
