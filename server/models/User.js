import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {type: String, required: [true, "Name is required"], trim: true, maxlength: 50},
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {type: String, trim: true},
        // select = false means that the password will not be returned in queries by default
        password: {type: String, select: false},
        googleId: {type: String},
        // role isnever taken from the request body, Register always makes a buyer.
        role: {type: String, enum: ["buyer", "admin"], default: "buyer"},
    },
    {timestamps: true}
);

// Hash the passwrod with bcrypt before saving the user to the database
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare the password entered by the user with the hashed password stored in the database
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);