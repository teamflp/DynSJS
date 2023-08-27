import {DynSJS} from "../src/Classes/DynSJS.js";
import expect from "expect";

function test(methodChainingShouldWorkCorrectly, param2) {
    console.log(methodChainingShouldWorkCorrectly, param2);
}

test('method chaining should work correctly', () => {
    let style = new DynSJS();
    style.set({ backgroundColor: 'red' })
        .nested('h1')
        .set({ color: 'blue' })
        .media('(max-width: 600px)')
        .set({ backgroundColor: 'green' });

    expect(style._properties).toEqual({ backgroundColor: 'red' });
    expect(style._selectors).toEqual(['.box h1']);
    expect(style._mediaQueries).toEqual([{ query: '(max-width: 600px)', rule: expect.any(DynSJS) }]);
});

test('nested selectors should be handled correctly', () => {
    let style = new DynSJS();
    style.nested('h1').nested('span').set({ color: 'blue' });
    expect(style._selectors).toEqual(['.box h1 span']);
});

test('nested media queries should be handled correctly', () => {
    let style = new DynSJS();
    style.media('(max-width: 600px)').media('(min-width: 400px)').set({ backgroundColor: 'green' });
    expect(style._mediaQueries[0].rule._mediaQueries).toEqual([{ query: '(min-width: 400px)', rule: expect.any(DynSJS) }]);
});

test('conditions should be evaluated correctly', () => {
    let style = new DynSJS();
    style.when(() => false).set({ backgroundColor: 'red' });
    expect(style.toCSS()).toBe(null);
});

test('CSS should be generated correctly for complex scenarios', () => {
    let style = new DynSJS();
    style.set({ backgroundColor: 'red' })
        .nested('h1')
        .set({ color: 'blue' })
        .media('(max-width: 600px)')
        .set({ backgroundColor: 'green' });

    const css = style.toCSS();
    expect(css).toEqual({
        result: { selector: '.box', properties: 'background-color: red;' },
        childrenCSS: '.box h1 { color: blue; }',
        mediaCSS: [{ query: '(max-width: 600px)', css: '.box h1 { background-color: green; }' }]
    });
});

