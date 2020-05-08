const request = require('request-promise')

 function get(url) {
    return request(url, {timeout: 300000});
}

 function post(url, data) {
    return request({
        method: 'POST',
        url,
        headers: {
            contentType: 'application/json; charset=utf-8'
        },
        body: data,
        json: true,
        timeout: 300000
    });
}

module.exports = {
  get,
  post,
}