const { generateToken, hashToken } = require("../../src/utils/authToken");

describe("authToken utility", () => {
    test("generateToken returns a random non-empty string", () => {
        const tokenA = generateToken();
        const tokenB = generateToken();

        expect(typeof tokenA).toBe("string");
        expect(typeof tokenB).toBe("string");
        expect(tokenA.length).toBeGreaterThan(20);
        expect(tokenA).not.toBe(tokenB);
    });

    test("hashToken returns deterministic sha256 hash", () => {
        const token = "sample-token";

        const hashA = hashToken(token);
        const hashB = hashToken(token);

        expect(hashA).toBe(hashB);
        expect(hashA).toMatch(/^[a-f0-9]{64}$/);
    });
});
