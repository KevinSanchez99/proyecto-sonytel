export const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({
        message: "Error de validación",
        errors: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    return res.status(500).json({ message: "Error inesperado" });
  }
};