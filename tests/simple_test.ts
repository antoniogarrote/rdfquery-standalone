import {RDFLibGraph, RDFLibGraphIterator} from "../src/rdflib_graph_implementation";
import RDFLibTermFactory from "../src/rdflib_implementation";

const data = '{\n' +
    '  "@id": "http://test.com/the-parameter",\n' +
    '  "@type": [\n' +
    '    "http://raml.org/vocabularies/http#Parameter",\n' +
    '    "http://raml.org/vocabularies/document#DomainElement"\n' +
    '  ],\n' +
    '  "http://raml.org/vocabularies/http#binding": [\n' +
    '    {\n' +
    '      "@value": "path"\n' +
    '    }\n' +
    '  ],\n' +
    '  "http://www.w3.org/ns/hydra/core#required": "hey",\n' +
    '  "http://raml.org/vocabularies/http#schema": [\n' +
    '    {\n' +
    '      "@id": "http://test.com/the-schema",\n' +
    '      "@type": [\n' +
    '        "http://raml.org/vocabularies/shapes#Shape",\n' +
    '        "http://raml.org/vocabularies/shapes#Object",\n' +
    '        "http://www.w3.org/ns/shacl#NodeShape",\n' +
    '        "http://www.w3.org/ns/shacl#Shape",\n' +
    '        "http://raml.org/vocabularies/document#DomainElement"\n' +
    '      ]\n' +
    '    }\n' +
    '  ],\n' +
    '  "http://schema.org/name": [\n' +
    '    {\n' +
    '      "@value": "name"\n' +
    '    }\n' +
    '  ]\n' +
    '}';

export function loadFindTest(test) {
    let graph = new RDFLibGraph();
    graph.loadGraph(data, 'urn:test-graph','application/ld+json', (error, graph) => {
        if (error != null) {
            test.ok(error == null);
            test.done();
        } else if (graph != null) {
            // get all the triples
            let iterator: RDFLibGraphIterator = graph.find(null,null,null);
            test.ok(iterator.source != null);
            let result  = iterator.next();
            let acc = [];
            while(result != null) {
                test.ok(result.subject != null);
                test.ok(result.predicate != null);
                test.ok(result.object != null);
                acc.push(result);
                result = iterator.next();
            }
            test.ok(acc.length === 11);

            // get triples constrained by subject
            iterator = graph.find(RDFLibTermFactory.namedNode("http://test.com/the-parameter"),null,null);
            test.ok(iterator.source != null);
            result  = iterator.next();
            acc = [];
            while(result != null) {
                test.ok(result.subject != null);
                test.ok(result.predicate != null);
                test.ok(result.object != null);
                acc.push(result);
                result = iterator.next();
            }
            test.ok(acc.length === 6);
            test.done();
        } else {
            test.ok(graph != null);
            test.done();
        }
    });
}

export function loadQuery(test) {
    let graph = new RDFLibGraph();
    graph.loadGraph(data, 'urn:test-graph','application/ld+json', (error, graph) => {
        if (error != null) {
            test.ok(error == null);
            test.done();
        } else if (graph != null) {
            // get all the triples
            const allCount = graph
                .query()
                .match("?s","?p","?o")
                .getCount();
            test.ok(allCount === 11);

            // get triples constrained by subject
            const parameterCount = graph
                .query()
                .match("http://test.com/the-parameter","?p","?o")
                .getCount();
            test.ok(parameterCount === 6);
            test.done();
        } else {
            test.ok(graph != null);
            test.done();
        }
    });
}