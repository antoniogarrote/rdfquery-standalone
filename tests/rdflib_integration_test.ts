import RDFLibTermFactory from "../src/rdflib_implementation";
import {Literal, RDFTerm} from "../src/rdf_interfaces";

RDFLibTermFactory.registerNamespace("xsd", "http://www.w3.org/2001/XMLSchema#");

export function literalTest1(test) {
    const result = RDFLibTermFactory.literal("test", "it");
    test.ok(result.language === "it");
    test.ok(result.datatype.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString");
    test.done();
}


export function literalTest2(test) {
    const result = RDFLibTermFactory.literal("test");
    test.ok(result.language === "");
    test.ok(result.datatype.value === "http://www.w3.org/2001/XMLSchema#string");
    test.done();
}

export function literalTest3(test) {
    const result = RDFLibTermFactory.term("2.0") as Literal;
    test.ok(result.language === "");
    test.ok(result.datatype.value === "http://www.w3.org/2001/XMLSchema#float");
    test.done();
}

export function literalTest4(test) {
    const result = RDFLibTermFactory.term("2") as Literal;
    test.ok(result.language === "");
    test.ok(result.datatype.value === "http://www.w3.org/2001/XMLSchema#integer");
    test.done();
}

export function uri1(test) {
    const result = RDFLibTermFactory.term("xsd:string");
    test.ok(result.isURI());
    test.ok(result.value === "http://www.w3.org/2001/XMLSchema#string");
    test.done();
}


export function uri2(test) {
    const result = RDFLibTermFactory.term("http://test.com");
    test.ok(result.isURI());
    test.ok(result.value === "http://test.com");
    test.done();
}

export function uri3(test) {
    const result = RDFLibTermFactory.term("ftp://test.com/something/here.txt");
    test.ok(result.isURI());
    test.ok(result.value === "ftp://test.com/something/here.txt");
    test.done();
}

export function uri4(test) {
    const result = RDFLibTermFactory.term("urn:oasis:names:specification:docbook:dtd:xml:4.1.2");
    test.ok(result.isURI());
    test.ok(result.value === "urn:oasis:names:specification:docbook:dtd:xml:4.1.2");
    test.done();
}

export function uri5(test) {
    const result = RDFLibTermFactory.term("tel:+1-816-555-1212");
    test.ok(result.isURI());
    test.ok(result.value === "tel:+1-816-555-1212");
    test.done();
}