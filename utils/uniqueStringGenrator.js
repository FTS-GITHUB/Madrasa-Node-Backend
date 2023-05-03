const randomString = (length) => {
    var result = '';
    let chars =
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = length; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

module.exports = randomString