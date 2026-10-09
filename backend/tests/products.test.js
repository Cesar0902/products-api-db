import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app.js";

const product = { id: 1, nombre: "Laptop", precio: "25.50", descripcion: "A useful laptop", disponible: 1, categoria_id: 2, categoria: "Tecnología" };
const input = { nombre: "Laptop", precio: 25.5, descripcion: "A useful laptop", categoria: "Tecnología", disponible: true };

async function request(t, method, path, body, steps = [], raw = false) {
  const calls = [];
  const execute = async (sql, params = []) => {
    calls.push({ sql, params });
    const step = steps.shift();
    assert.ok(step, `Unexpected SQL: ${sql}`);
    assert.match(sql, step.sql);
    if (step.params) assert.deepEqual(params, step.params);
    if (step.error) throw step.error;
    return [step.result, []];
  };
  const db = { execute, query: execute };
  const app = createApp({ db });
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined && { body: raw ? body : JSON.stringify(body) }),
  });
  const data = response.headers.get("content-type")?.includes("application/json") ? await response.json() : await response.text();
  return { response, data, calls, remaining: steps.length };
}

test("product list exposes booleans, numeric prices and category names", async t => {
  const { response, data } = await request(t, "GET", "/productos", undefined, [{ sql: /SELECT/, result: [product] }]);
  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.data[0].disponible, true);
  assert.equal(data.data[0].precio, 25.5);
  assert.equal(data.data[0].categoria, "Tecnología");
});

test("product update issues parameterized UPDATE and reads mysql2 rows", async t => {
  const { response, data, calls, remaining } = await request(t, "PATCH", "/productos/1", { precio: 30, disponible: false }, [
    { sql: /SELECT.*WHERE p.id = \?/s, params: [1], result: [product] },
    { sql: /^UPDATE productos SET precio = \?, disponible = \? WHERE id = \?$/, params: [30, false, 1], result: { affectedRows: 1 } },
    { sql: /SELECT.*WHERE p.id = \?/s, params: [1], result: [{ ...product, precio: "30.00", disponible: 0 }] },
  ]);
  assert.equal(response.status, 200);
  assert.equal(data.data.disponible, false);
  assert.equal(data.data.precio, 30);
  assert.equal(remaining, 0);
  assert.ok(calls.some(call => call.sql.startsWith("UPDATE")));
});

test("product delete issues parameterized DELETE", async t => {
  const { response, data, remaining } = await request(t, "DELETE", "/productos/1", undefined, [
    { sql: /^DELETE FROM productos WHERE id = \?$/, params: [1], result: { affectedRows: 1 } },
  ]);
  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.equal(remaining, 0);
});

test("empty lists are successful collections", async t => {
  const { response, data } = await request(t, "GET", "/productos", undefined, [{ sql: /SELECT/, result: [] }]);
  assert.equal(response.status, 200);
  assert.deepEqual(data.data, []);
  assert.equal(data.success, true);
});

test("invalid product input returns field errors without SQL", async t => {
  const { response, data, calls } = await request(t, "POST", "/productos", {});
  assert.equal(response.status, 400);
  assert.ok(data.errors.some(error => error.field === "nombre"));
  assert.equal(calls.length, 0);
});

test("repeated availability parameters are rejected as 400", async t => {
  const { response, data } = await request(t, "GET", "/productos?disponible=true&disponible=false");
  assert.equal(response.status, 400);
  assert.equal(data.success, false);
});

test("frontend is served by the app without database access", async t => {
  const { response, data, calls } = await request(t, "GET", "/");
  assert.equal(response.status, 200);
  assert.match(data, /<html/i);
  assert.equal(calls.length, 0);
});

test("create resolves category by name and uses insertId with default availability", async t => {
  const { disponible, ...body } = input;
  const { response, data, remaining } = await request(t, "POST", "/productos", body, [
    { sql: /SELECT id FROM productos WHERE nombre = \?/, params: ["Laptop"], result: [] },
    { sql: /SELECT id FROM categorias WHERE LOWER\(nombre\) = LOWER\(\?\)/, params: ["Tecnología"], result: [{ id: 2 }] },
    { sql: /^INSERT INTO productos/, params: ["Laptop", 25.5, "A useful laptop", true, 2], result: { insertId: 1 } },
    { sql: /WHERE p.id = \?/, params: [1], result: [product] },
  ]);
  assert.equal(response.status, 201);
  assert.equal(data.data.id, 1);
  assert.equal(data.data.disponible, true);
  assert.equal(remaining, 0);
});

test("category names containing SQL syntax are values, never interpolated SQL", async t => {
  const categoria = "Hogar' OR 1=1 --";
  const { response, calls } = await request(t, "POST", "/productos", { ...input, categoria }, [
    { sql: /SELECT id FROM productos WHERE nombre = \?/, params: ["Laptop"], result: [] },
    { sql: /LOWER\(nombre\) = LOWER\(\?\)/, params: [categoria], result: [] },
  ]);
  assert.equal(response.status, 400);
  assert.ok(calls.every(call => !call.sql.includes(categoria)));
});

test("duplicate products are rejected even on legacy databases without uniqueness", async t => {
  const { response, data, remaining } = await request(t, "POST", "/productos", input, [
    { sql: /SELECT id FROM productos WHERE nombre = \?/, params: ["Laptop"], result: [{ id: 1 }] },
  ]);
  assert.equal(response.status, 409);
  assert.match(data.message, /existe/i);
  assert.equal(remaining, 0);
});

test("product database uniqueness race maps to 409", async t => {
  const { response } = await request(t, "POST", "/productos", input, [
    { sql: /SELECT id FROM productos/, result: [] },
    { sql: /SELECT id FROM categorias/, result: [{ id: 2 }] },
    { sql: /INSERT INTO productos/, error: Object.assign(new Error("secret SQL"), { code: "ER_DUP_ENTRY" }) },
  ]);
  assert.equal(response.status, 409);
});

test("product category updates resolve names into FK IDs", async t => {
  const { response, data, remaining } = await request(t, "PUT", "/productos/1", { categoria: "Hogar" }, [
    { sql: /WHERE p.id = \?/, params: [1], result: [product] },
    { sql: /SELECT id FROM categorias/, params: ["Hogar"], result: [{ id: 3 }] },
    { sql: /^UPDATE productos SET categoria_id = \? WHERE id = \?$/, params: [3, 1], result: { affectedRows: 1 } },
    { sql: /WHERE p.id = \?/, params: [1], result: [{ ...product, categoria_id: 3, categoria: "Hogar" }] },
  ]);
  assert.equal(response.status, 200);
  assert.equal(data.data.categoria, "Hogar");
  assert.equal(remaining, 0);
});

test("product rename excludes itself when checking duplicates", async t => {
  const { response, remaining } = await request(t, "PATCH", "/productos/1", { nombre: "Laptop" }, [
    { sql: /WHERE p.id = \?/, result: [product] },
    { sql: /SELECT id FROM productos WHERE nombre = \? AND id <> \?/, params: ["Laptop", 1], result: [] },
    { sql: /^UPDATE productos SET nombre = \? WHERE id = \?$/, params: ["Laptop", 1], result: { affectedRows: 1, changedRows: 0 } },
    { sql: /WHERE p.id = \?/, result: [product] },
  ]);
  assert.equal(response.status, 200);
  assert.equal(remaining, 0);
});

test("duplicate product rename returns 409 without UPDATE", async t => {
  const { response, calls } = await request(t, "PATCH", "/productos/1", { nombre: "Other" }, [
    { sql: /WHERE p.id = \?/, result: [product] },
    { sql: /SELECT id FROM productos WHERE nombre = \? AND id <> \?/, params: ["Other", 1], result: [{ id: 2 }] },
  ]);
  assert.equal(response.status, 409);
  assert.ok(!calls.some(call => call.sql.startsWith("UPDATE")));
});

for (const body of [{}, { precio: -1 }, { disponible: "false" }, { categoria_id: 2 }, { "nombre = NULL --": "bad" }, { nombre: " " }]) {
  test(`invalid product patch is rejected without SQL: ${JSON.stringify(body)}`, async t => {
    const { response, data, calls } = await request(t, "PATCH", "/productos/1", body);
    assert.equal(response.status, 400);
    assert.ok(data.errors.length > 0);
    assert.equal(calls.length, 0);
  });
}

for (const path of ["/productos?disponible=invalid", "/productos/1%20OR%201=1", "/productos/0", "/productos/2147483648"]) {
  test(`invalid product query or ID rejected: ${path}`, async t => {
    const { response, calls } = await request(t, "GET", path);
    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
  });
}

for (const path of ["/productos?disponible=false", "/productos/disponibles"]) {
  test(`availability filter is parameterized: ${path}`, async t => {
    const available = path.endsWith("disponibles");
    const { response, data, remaining } = await request(t, "GET", path, undefined, [
      { sql: /WHERE p.disponible = \? ORDER BY p.id/, params: [available], result: [{ ...product, disponible: available ? 1 : 0 }] },
    ]);
    assert.equal(response.status, 200);
    assert.equal(data.data[0].disponible, available);
    assert.equal(remaining, 0);
  });
}

test("product detail preserves one-item array envelope", async t => {
  const { response, data } = await request(t, "GET", "/productos/1", undefined, [{ sql: /WHERE p.id = \?/, params: [1], result: [product] }]);
  assert.equal(response.status, 200);
  assert.equal(data.data.length, 1);
  assert.equal(data.data[0].id, 1);
  assert.match(data.message, /Laptop/);
});

for (const method of ["GET", "PATCH", "DELETE"]) {
  test(`missing product returns 404 for ${method}`, async t => {
    const { response, data } = await request(t, method, "/productos/9", method === "PATCH" ? { precio: 30 } : undefined, [
      { sql: method === "DELETE" ? /DELETE FROM productos/ : /WHERE p.id = \?/, params: [9], result: method === "DELETE" ? { affectedRows: 0 } : [] },
    ]);
    assert.equal(response.status, 404);
    assert.equal(data.success, false);
  });
}

test("malformed JSON returns the API error envelope", async t => {
  const { response, data, calls } = await request(t, "POST", "/productos", "{", [], true);
  assert.equal(response.status, 400);
  assert.equal(data.success, false);
  assert.equal(calls.length, 0);
});

test("database failures do not leak SQL or credentials", async t => {
  const { response, data } = await request(t, "GET", "/productos", undefined, [{ sql: /SELECT/, error: new Error("password: secret; SELECT private") }]);
  assert.equal(response.status, 500);
  assert.deepEqual(data, { success: false, message: "Error interno del servidor" });
});

test("static frontend paths are independent of cwd and API is same-origin", async t => {
  const cwd = process.cwd();
  process.chdir("/");
  t.after(() => process.chdir(cwd));
  const { response, data } = await request(t, "GET", "/script.js");
  assert.equal(response.status, 200);
  assert.match(data, /const API_BASE_URL = ''/);
  assert.ok(!data.includes("http://localhost:3000"));
});
