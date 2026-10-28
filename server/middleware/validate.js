import fs from "fs";
import xss from "xss";

// Fields where we must not change any character (passwords, tokens)
const SKIP_KEYS = ["password", "currentPassword", "newPassword", "idToken"];

// Remove dangerous HTML/script from every text value (XSS protection)
const clean = (value, key) => {
  if (SKIP_KEYS.includes(key)) return value;
  if (typeof value === "string") return xss(value);
  if (Array.isArray(value)) return value.map((v) => clean(v));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v, k)]));
  }
  return value;
};

// Use in routes: validate(someSchema)
const validate = (schema) => (req, res, next) => {
  try {
    // zod removes unknown fields, so a user can never send "role: admin"
    req.body = schema.parse(clean(req.body));
    next();
  } catch (error) {
    // If an image was uploaded but the data is wrong, delete the image
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error); // errorHandler turns ZodError into a 400 message
  }
};

export default validate;