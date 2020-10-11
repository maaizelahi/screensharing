import { randomBytes } from "crypto";

/**
 *
 */
export const generateToken = () => {
    const buf = randomBytes(4);

    return buf.toString("hex");
};
