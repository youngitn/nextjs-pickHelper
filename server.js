/* eslint-disable no-console */
const express = require('express')
const next = require('next')
// const fs = require("fs");

// fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
//     console.log(data);
//     //res.end(data);
// });


const devProxy = {
    '/kanbanApi': {
        target: 'http://127.0.0.1:8081/kanbanApi',
        pathRewrite: { '^/kanbanApi': '/' },
        changeOrigin: true,
    },
    '/shiro': {
        target: 'http://127.0.0.1:8081/',
        pathRewrite: { '^/shiro': '/' },
        changeOrigin: true,
    },
}

const proProxy = {
    '/kanbanApi': {
        target: 'http://127.0.0.1:8081/kanbanApi',
        pathRewrite: { '^/kanbanApi': '/' },
        changeOrigin: true,
    },
}

const port = parseInt(process.env.PORT, 10) || 3000
const env = process.env.NODE_ENV
const dev = env !== 'production'
const app = next({
    dir: '.', // base directory where everything is, could move to src later
    dev,
})

const handle = app.getRequestHandler()
const buildProxy = (server, proxy) => {
    const { createProxyMiddleware } = require('http-proxy-middleware')
    Object.keys(proxy).forEach(function (context) {
        server.use(context, createProxyMiddleware(proxy[context]))
    })
}
let server
app
    .prepare()
    .then(() => {
        server = express()
        server.get('/123', (req, res) => {
            res.send('Hello World!')
        })
        // Set up the proxy.

        if (dev && devProxy) {
            buildProxy(server, devProxy);
        } else if (!dev && proProxy) {
            buildProxy(server, proProxy);
        }
        //buildProxy(server, proProxy);
        // Default catch-all handler to allow Next.js to handle all other routes
        server.all('*', (req, res) => handle(req, res))

        server.listen(port, (err) => {
            if (err) {
                throw err
            }
            console.log(`> Ready on port ${port} [${env}]`)
        })
    })
    .catch((err) => {
        console.log('An error occurred, unable to start the server')
        console.log(err)
    })

