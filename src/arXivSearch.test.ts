import { removeNewline } from "./arXivSearch.js";

test("removeNewline", () => {
    const source = 'hello.\n    I am Panda.';
    const target = 'hello. I am Panda.';
    expect(removeNewline(source)).toStrictEqual(target);
});
