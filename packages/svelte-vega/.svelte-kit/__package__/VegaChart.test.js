// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file VegaChart.test.ts
 * @input Mocked Vega runtime, Vega/Vega-Lite specs, ResizeObserver callbacks, and theme fixtures
 * @output DOM lifecycle and config parity coverage for the private Svelte Vega wrapper
 * @position Red-first test suite for Todo 18 Svelte Vega implementation
 */
import { mount, tick, unmount } from 'svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VegaThemeHarness from './test-fixtures/VegaThemeHarness.svelte';
import { VegaChart, parseSchema } from './index.js';
import { buildVegaLiteConfig } from './vegaLiteConfig.js';
const { MockView, compileMock, disconnectMock, observeMock, parseMock, resizeCallbacks, viewInstances, } = vi.hoisted(() => {
    class HoistedMockView {
        runtime;
        options;
        dataMock = vi.fn();
        finalizeMock = vi.fn();
        resizeMock = vi.fn();
        runAsyncMock = vi.fn();
        constructor(runtime, options) {
            this.runtime = runtime;
            this.options = options;
            this.runAsyncMock.mockResolvedValue(this);
            this.dataMock.mockReturnValue(this);
            this.resizeMock.mockReturnValue(this);
            hoistedViewInstances.push(this);
        }
        data(name, tuples) {
            return this.dataMock(name, tuples);
        }
        finalize() {
            this.finalizeMock();
        }
        resize() {
            return this.resizeMock();
        }
        runAsync() {
            return this.runAsyncMock();
        }
    }
    const hoistedViewInstances = [];
    return {
        MockView: HoistedMockView,
        compileMock: vi.fn(),
        disconnectMock: vi.fn(),
        observeMock: vi.fn(),
        parseMock: vi.fn(),
        resizeCallbacks: new Array(),
        viewInstances: hoistedViewInstances,
    };
});
vi.mock('vega', () => ({
    parse: parseMock,
    View: MockView,
}));
vi.mock('vega-lite', () => ({
    compile: compileMock,
}));
function createTarget() {
    const target = document.createElement('div');
    document.body.appendChild(target);
    return target;
}
function requireFirstElement(target) {
    const element = target.firstElementChild;
    if (element == null) {
        throw new Error('Expected mounted component to render a root element.');
    }
    return element;
}
const vegaSpec = {
    $schema: 'https://vega.github.io/schema/vega/v5.json',
    data: [{ name: 'table' }],
    marks: [],
};
const vegaLiteSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { name: 'table' },
    mark: 'bar',
    encoding: {
        x: { field: 'category', type: 'ordinal' },
        y: { field: 'value', type: 'quantitative' },
    },
};
describe('Svelte VegaChart', () => {
    beforeEach(() => {
        parseMock.mockReset();
        compileMock.mockReset();
        viewInstances.length = 0;
        resizeCallbacks.length = 0;
        observeMock.mockReset();
        disconnectMock.mockReset();
        parseMock.mockImplementation((spec) => ({ runtime: true, spec }));
        compileMock.mockImplementation((spec) => ({ spec: { compiled: true, source: spec } }));
        vi.stubGlobal('ResizeObserver', class {
            constructor(callback) {
                resizeCallbacks.push(callback);
            }
            observe = observeMock;
            disconnect = disconnectMock;
        });
    });
    it('Given a Vega spec and data When mounted Then it parses directly, creates one view, loads data, and reports readiness', async () => {
        const target = createTarget();
        const onReady = vi.fn();
        const data = { table: [{ category: 'A', value: 1 }] };
        const app = mount(VegaChart, { target, props: { spec: vegaSpec, data, onReady } });
        await tick();
        await Promise.resolve();
        expect(compileMock).not.toHaveBeenCalled();
        expect(parseMock).toHaveBeenCalledWith(vegaSpec, undefined, undefined);
        expect(viewInstances).toHaveLength(1);
        expect(viewInstances[0]?.options.container).toBe(requireFirstElement(target));
        expect(viewInstances[0]?.options.hover).toBe(true);
        expect(viewInstances[0]?.dataMock).toHaveBeenCalledWith('table', data.table);
        expect(onReady).toHaveBeenCalledWith(viewInstances[0]);
        await unmount(app);
    });
    it('Given a Vega-Lite spec When mounted in a theme Then it compiles with Astryx theme config and renders the compiled spec', async () => {
        const target = createTarget();
        const onReady = vi.fn();
        const app = mount(VegaThemeHarness, { target, props: { spec: vegaLiteSpec, onReady } });
        await tick();
        await Promise.resolve();
        const compileOptions = compileMock.mock.calls[0]?.[1];
        expect(compileMock).toHaveBeenCalledWith(vegaLiteSpec, expect.any(Object));
        expect(compileOptions?.config).toMatchObject({
            background: '#101010',
            axis: { labelFont: 'Inter' },
            range: { category: expect.arrayContaining(['#0055ff']) },
        });
        expect(parseMock).toHaveBeenCalledWith({ compiled: true, source: vegaLiteSpec }, undefined, undefined);
        expect(onReady).toHaveBeenCalledWith(viewInstances[0]);
        await unmount(app);
    });
    it('Given an invalid schema When mounted Then it reports an error and does not create a view', async () => {
        const target = createTarget();
        const onError = vi.fn();
        const invalidSpec = { $schema: 'https://example.com/schema.json', marks: [] };
        const app = mount(VegaChart, { target, props: { spec: invalidSpec, onError } });
        await tick();
        expect(onError.mock.calls[0]?.[0].message).toContain('Unrecognized $schema URL');
        expect(parseMock).not.toHaveBeenCalled();
        expect(viewInstances).toHaveLength(0);
        await unmount(app);
    });
    it('Given ResizeObserver support When the container resizes Then it reruns Vega resize without replacing the view', async () => {
        const target = createTarget();
        const app = mount(VegaChart, { target, props: { spec: vegaSpec } });
        await tick();
        await Promise.resolve();
        const view = viewInstances[0];
        expect(observeMock).toHaveBeenCalledWith(requireFirstElement(target));
        expect(resizeCallbacks).toHaveLength(1);
        resizeCallbacks[0]?.([], new ResizeObserver(() => undefined));
        await Promise.resolve();
        expect(view?.resizeMock).toHaveBeenCalledTimes(1);
        expect(view?.runAsyncMock).toHaveBeenCalledTimes(2);
        expect(viewInstances).toHaveLength(1);
        await unmount(app);
    });
    it('Given an active chart When unmounted Then it disconnects resize observation and finalizes the view once', async () => {
        const target = createTarget();
        const app = mount(VegaChart, { target, props: { spec: vegaSpec } });
        await tick();
        await Promise.resolve();
        const view = viewInstances[0];
        await unmount(app);
        expect(disconnectMock).toHaveBeenCalledTimes(1);
        expect(view?.finalizeMock).toHaveBeenCalledTimes(1);
    });
    it('Given a token resolver When config is built Then Astryx Vega-Lite defaults map expected theme tokens', () => {
        const config = buildVegaLiteConfig((name) => `token:${name}`);
        expect(config.axis?.labelColor).toBe('token:--color-text-secondary');
        expect(config.background).toBe('token:--color-background-card');
        expect(config.range?.category).toContain('token:--color-data-categorical-blue');
        expect(config.view?.stroke).toBeNull();
    });
    it('Given schema inputs When parsed Then valid Vega/Vega-Lite schemas resolve and invalid schemas return typed errors', () => {
        expect(parseSchema('https://vega.github.io/schema/vega/v5.json')).toEqual({
            ok: true,
            library: 'vega',
            version: 'v5',
        });
        expect(parseSchema('https://vega.github.io/schema/vega-lite/v5.json')).toEqual({
            ok: true,
            library: 'vega-lite',
            version: 'v5',
        });
        expect(parseSchema('https://vega.github.io/schema/not-vega/v1.json')).toEqual({
            ok: false,
            error: 'Unknown schema library "not-vega". Must be "vega" or "vega-lite".',
        });
        expect(parseSchema(undefined)).toMatchObject({ ok: false });
    });
});
