import { QueryEngine } from "@frink-okn/kgf-sparql";

/**
 * The page's one query engine: kgf-sparql, Comunica configured for KGF's native
 * fragment routes and for federation with SPARQL endpoints. Shared, so that its
 * per-host pacing of requests covers every query the page runs.
 */
export const engine = new QueryEngine();
