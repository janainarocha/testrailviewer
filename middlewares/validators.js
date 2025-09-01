// Middlewares de validação de parâmetros

function validateIdParam(paramName) {
    return (req, res, next) => {
        const value = req.params[paramName];
        if (!value || !/^\d+$/.test(value)) {
            return res.status(400).json({ error: `Invalid ${paramName}.` });
        }
        next();
    };
}

function validateProjectAndSuite(req, res, next) {
    const { projectId, suiteId } = req.params;
    if (!projectId || !/^\d+$/.test(projectId) || !suiteId || !/^\d+$/.test(suiteId)) {
        return res.status(400).json({ error: 'Invalid project ID or suite ID.' });
    }
    next();
}

module.exports = {
    validateIdParam,
    validateProjectAndSuite
};
