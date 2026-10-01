# Vendored kgf-sparql

`kgf-sparql` and its `@kgf/*` actor packages, packed from
[frink-okn/kgf-sparql](https://github.com/frink-okn/kgf-sparql) until they are published
to npm. `package.json` depends on `kgf-sparql-0.1.0.tgz` and pins every `@kgf/*`
dependency to its tarball through `overrides`.

Packed from kgf-sparql commit `3ecd035` (branch `federated-join-actors`). To repack, from a
built kgf-sparql checkout (`npm install --ignore-scripts && npm run build`):

```bash
for w in @kgf/actor-query-source-identify-kgf @kgf/actor-rdf-join-selectivity-void \
  @kgf/actor-rdf-join-inner-multi-bind-round-trip @kgf/actor-rdf-join-selectivity-bound \
  @kgf/actor-rdf-join-inner-multi-bind-block @kgf/actor-http-throttle \
  @kgf/actor-query-source-identify-hypermedia-sparql-bounded kgf-sparql; do
  npm pack -w "$w" --ignore-scripts --pack-destination ../frink-query-ui/vendor/kgf-sparql
done
```

then, here, delete the `node_modules/kgf-sparql` and `node_modules/@kgf/*` entries from
`package-lock.json` and those folders from `node_modules`, and run `npm install`: the
lockfile holds the old tarballs' integrity hashes, and npm otherwise reinstalls them from
its cache.
