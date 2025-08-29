const logger = (req, res, next) =>  {
    console.log(`${req.method}: Request received on ${req.url}. Logger via Middleware`);
    next();
}

module.exports = { 
    logger
}
