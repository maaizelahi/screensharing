import { randomBytes } from "crypto";

/**
 *  Generates unique screenId
 */
export const generateScreenId = () => {
    const buf = randomBytes(4);

    return buf.toString("hex");
};
