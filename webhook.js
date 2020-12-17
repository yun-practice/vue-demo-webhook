let http = require('http');
let crypto = require('crypto');
let { spawn } = require('child_process'); // 开启一个子进程
let SECRET = '123456'; // 跟github webhooks中的秘钥一样
function sign(body) {
    // crypto.createHmac(名字, 秘钥), update()里面放入你要加密的文本, digest()里面放入16进制字符串 hex编码
    return `sha1=` + crypto.createHmac('sha1', SECRET).update(body).digest('hex');
}

let server = http.createServer((req, res) => {
    console.log(req.method, req.url);
    if (req.method == 'POST' && req.url == '/webhook') {
        let buffers = [];
        req.on('data', (buffer) => {
            buffers.push(buffer);
        });
        req.on('end', (buffer) => {
            let body = Buffer.concat(buffers);
            let event = req.headers['x-github-event']; // event = push
            // github请求过来的时候,要传递请求体body,另外还会传一个signature，你需要验证签名对不对
            let signature = req.headers['x-hub-signature'];
            if (signature !== sign(body)) {
                return res.end('Not Found');
            }
            // 给github服务器发一个回应
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
            // 部署脚本
            if (event == 'push') {
                // 开始部署
                let payload = JSON.parse(body);
                // vue-service 推到github, 上面是vue-demo-service, 所以这里是vue-demo-service
                console.log('payload ===> ', payload.repository.name);
                // 为了不堵塞当前的进程，开启一个子进程,跑一段脚本，执行仓库下的.sh(如vue-app.sh or vue-service.sh)
                let child = spawn('sh', [`./${payload.repository.name}.sh`]);
                // 监听子进程中的日志
                let buffers = [];
                child.stdout.on('data', (buffer) => {
                    buffers.push(buffer);
                });
                child.stdout.on('end', (buffer) => {
                    let log = Buffer.concat(buffers);
                    console.log(log);
                });
            }
        });
    } else {
        res.end('Not Found');
    }
});

server.listen(5000, () => {
    console.log('服务已经在5000端口上启动了');
});
