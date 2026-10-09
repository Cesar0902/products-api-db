import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app.js";

async function request(t, method, path, body, steps = []) {
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
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  return { response, data, calls, remaining: steps.length };
}

test("category validation reports Zod field issues", async t => {
  const { response, data, calls } = await request(t, "POST", "/categorias", { nombre: "x" });
  assert.equal(response.status, 400);
  assert.ok(data.errors.some(error => error.field === "nombre"));
  assert.equal(calls.length, 0);
});

test("used categories cannot be deleted and return 409", async t => {
  const { response, data, calls } = await request(t, "DELETE", "/categorias/2", undefined, [
    { sql: /SELECT id FROM productos WHERE categoria_id = \?/, params: [2], result: [{ id: 1 }] },
  ]);
  assert.equal(response.status, 409);
  assert.equal(data.success, false);
  assert.equal(calls.length, 1);
});

test("duplicate categories return meaningful 409", async t => {
  const { response, data } = await request(t, "POST", "/categorias", { nombre: "Hogar" }, [
    { sql: /INSERT INTO categorias/, params: ["Hogar"], error: Object.assign(new Error("private database details"), { code: "ER_DUP_ENTRY" }) },
  ]);
  assert.equal(response.status, 409);
  assert.equal(typeof data.message, "string");
  assert.match(data.message, /existe/i);
  assert.ok(!data.message.includes("private"));
});

test("category IDs reject injection instead of executing SQL", async t => {
  const { response, calls } = await request(t, "GET", "/categorias/1%20OR%201=1");
  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
});

test("category list keeps the public collection envelope", async t => {
  const { response, data, remaining } = await request(t, "GET", "/categorias", undefined, [{ sql: /SELECT \* FROM categorias ORDER BY id/, result: [{ id: 1, nombre: "Hogar" }] }]);
  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.deepEqual(data.data, [{ id: 1, nombre: "Hogar" }]);
  assert.equal(remaining, 0);
});

test("empty categories are successful collections", async t => {
  const { response, data } = await request(t, "GET", "/categorias", undefined, [{ sql: /SELECT/, result: [] }]);
  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.deepEqual(data.data, []);
});

test("category creation trims names and returns insertId", async t => {
  const { response, data, remaining } = await request(t, "POST", "/categorias", { nombre: " Hogar " }, [
    { sql: /^INSERT INTO categorias \(nombre\) VALUES \(\?\)$/, params: ["Hogar"], result: { insertId: 2 } },
  ]);
  assert.equal(response.status, 201);
  assert.deepEqual(data.data, { id: 2, nombre: "Hogar" });
  assert.equal(remaining, 0);
});

test("category detail unwraps mysql2 rows", async t => {
  const { response, data } = await request(t, "GET", "/categorias/2", undefined, [
    { sql: /^SELECT \* FROM categorias WHERE id = \?$/, params: [2], result: [{ id: 2, nombre: "Hogar" }] },
  ]);
  assert.equal(response.status, 200);
  assert.deepEqual(data.data, { id: 2, nombre: "Hogar" });
});

test("category update persists parameterized SQL, including unchanged names", async t => {
  const { response, data, remaining } = await request(t, "PUT", "/categorias/2", { nombre: "Hogar" }, [
    { sql: /^UPDATE categorias SET nombre = \? WHERE id = \?$/, params: ["Hogar", 2], result: { affectedRows: 1, changedRows: 0 } },
  ]);
  assert.equal(response.status, 200);
  assert.deepEqual(data.data, { id: 2, nombre: "Hogar" });
  assert.equal(remaining, 0);
});

test("unused category deletion checks usage then executes DELETE", async t => {
  const { response, data, remaining } = await request(t, "DELETE", "/categorias/2", undefined, [
    { sql: /SELECT id FROM productos WHERE categoria_id = \? LIMIT 1/, params: [2], result: [] },
    { sql: /^DELETE FROM categorias WHERE id = \?$/, params: [2], result: { affectedRows: 1 } },
  ]);
  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.equal(remaining, 0);
});

for (const method of ["GET", "PUT", "DELETE"]) {
  test(`missing category returns 404 for ${method}`, async t => {
    const steps = method === "DELETE" ? [
      { sql: /SELECT id FROM productos/, result: [] },
      { sql: /DELETE FROM categorias/, params: [9], result: { affectedRows: 0 } },
    ] : [{ sql: method === "GET" ? /SELECT/ : /UPDATE/, result: method === "GET" ? [] : { affectedRows: 0 } }];
    const { response, data, remaining } = await request(t, method, "/categorias/9", method === "PUT" ? { nombre: "Hogar" } : undefined, steps);
    assert.equal(response.status, 404);
    assert.equal(data.success, false);
    assert.equal(remaining, 0);
  });
}

test("a concurrent category usage race is protected by the FK error", async t => {
  const { response, data } = await request(t, "DELETE", "/categorias/2", undefined, [
    { sql: /SELECT id FROM productos/, result: [] },
    { sql: /DELETE FROM categorias/, error: Object.assign(new Error("private SQL"), { code: "ER_ROW_IS_REFERENCED_2" }) },
  ]);
  assert.equal(response.status, 409);
  assert.match(data.message, /productos/);
});

test("category duplicate updates return 409", async t => {
  const { response } = await request(t, "PUT", "/categorias/2", { nombre: "Hogar" }, [
    { sql: /UPDATE categorias/, error: Object.assign(new Error("duplicate"), { code: "ER_DUP_ENTRY" }) },
  ]);
  assert.equal(response.status, 409);
});

test("category validation rejects unknown SQL column names", async t => {
  const { response, data, calls } = await request(t, "PUT", "/categorias/2", { nombre: "Hogar", id: 7 });
  assert.equal(response.status, 400);
  assert.ok(data.errors.length > 0);
  assert.equal(calls.length, 0);
});
