const express = require('express')
const app = express()

var server = app.listen(8082, function(){
    var host = server.address().address
    var port = server.address().port
    console.log('应用实例, 访问地址为 http://%s:%s', host, port)
})

var sendHtml = function(path, response) {
    var fs = require('fs')
    var options = {
        encoding: 'utf-8'
    }
    fs.readFile(path, options, function(err, data){
        response.send(data)
    })
}

app.get('/', function(request, response){
    var path = 'index.html'
    sendHtml(path, response)
})

var userList = []

const io = require('socket.io').listen(server)

io.on('connection', function(socket) {
    // 登录操作
    console.log('用户连接成功');
    socket.emit('whoAreYou')
    socket.on('name', (name) => {
        console.log('name : ', name);
        userList.push(name)
        socket.name = name
        // console.log('userList : ', userList);
    })

    // 消息操作
    socket.emit('message', '你登录了')
    socket.on('message', function(msg) {
        console.log(`收到了 ${msg}`)
        // 向所有的 socket 发送 message, 包括自己
        // io.sockets.emit('message', msg)
        // 向除自己外的 socket 发送 message
        var user = socket.name
        socket.broadcast.emit('message', `${user} : ${msg}`)
    })

    // 登出操作
    socket.on('disconnect', () => {
        console.log('有人离开了');
        userList.splice(userList.indexOf(socket.name), 1)
        socket.broadcast.emit('message', `${socket.name} 已经离开`)
    })
})
