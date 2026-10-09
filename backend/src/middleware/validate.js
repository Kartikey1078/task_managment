function getSourceData(req, source) {
  if (source === 'query') return req.query;
  if (source === 'params') return req.params;
  return req.body;
}

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = getSourceData(req, source);
    const parsed = schema.parse(data);
    if (source === 'params') {
      req.validatedParams = parsed;
    } else {
      req.validated = parsed;
    }
    next();
  };
}
