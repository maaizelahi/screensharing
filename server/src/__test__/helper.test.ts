import { generateScreenId } from "../helper";

it("Should return non empty string representing screenId", () => {
    const screenId = generateScreenId();

    expect(screenId).toBeDefined();
});

it("Should return unique screenIds everytime", () => {
    const screenId_1 = generateScreenId();
    const screenId_2 = generateScreenId();

    expect(screenId_1).not.toEqual(screenId_2);
});
