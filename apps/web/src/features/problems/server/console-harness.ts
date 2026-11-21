// Run before learner source so inspection keeps its own intrinsics. Formatting
// stays inside the guest's existing CPU/memory budget and never invokes getters.
export const consoleHarness = `(() => {
  const apply = Reflect.apply;
  const descriptor = Object.getOwnPropertyDescriptor;
  const create = Object.create;
  const hasOwn = Object.prototype.hasOwnProperty;
  const keys = Object.keys;
  const isArray = Array.isArray;
  const stringify = JSON.stringify;
  const string = String;
  const slice = String.prototype.slice;
  const cut = value => apply(slice, value, [0, 512]);
  function inspect(value) {
    const ancestors = create(null);
    let nodes = 0;
    function visit(value, depth) {
      const type = typeof value;
      if (type === 'string') return stringify(cut(value));
      if (value === null) return 'null';
      if (type === 'bigint') return string(value) + 'n';
      if (type === 'function') return '[Function]';
      if (type !== 'object') return string(value);
      for (let i = 0; i < depth; i++)
        if (ancestors[i] === value) return '[Circular]';
      const array = isArray(value);
      if (depth >= 4 || nodes++ >= 100) return array ? '[Array]' : '[Object]';
      ancestors[depth] = value;
      const names = array ? null : keys(value);
      const length = array ? descriptor(value, 'length').value : names.length;
      let output = array ? '[' : '{';
      for (let i = 0; i < length && i < 25; i++) {
        if (i) output += ',';
        const key = array ? string(i) : names[i];
        if (!array) output += stringify(cut(key)) + ':';
        const property = descriptor(value, key);
        output += !property ? '<empty>' : apply(hasOwn, property, ['value'])
          ? visit(property.value, depth + 1) : '[Getter]';
        if (output.length >= 512) return cut(output) + '…';
      }
      if (length > 25) output += ',…';
      return output + (array ? ']' : '}');
    }
    try { return cut(visit(value, 0)); }
    catch { return '[Unserializable]'; }
  }
  for (const level of ['log', 'warn', 'error']) {
    const capture = console[level];
    console[level] = (...args) => {
      const formatted = create(null);
      formatted.length = args.length < 8 ? args.length : 8;
      for (let i = 0; i < args.length && i < 8; i++) {
        const value = args[i];
        const type = typeof value;
        formatted[i] = type === 'string' || type === 'number' ||
          type === 'boolean' || type === 'undefined' ? value : inspect(value);
      }
      return apply(capture, undefined, formatted);
    };
  }
})()`;
