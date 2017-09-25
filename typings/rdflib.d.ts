declare module rdflib {

    export class Node {

    }

    export class BlankNode extends Node {
        constructor(id: string);
    }

    export class NamedNode extends Node  {
        constructor(uri: string);
    }

    export class Literal extends Node  {
        constructor(value: string, languageOrDatatype: string|NamedNode);
        constructor(value: string, language: string, datatype: NamedNode);
    }

    export function blankNode(id: string): BlankNode

    export function lit(value: string, language: string, datatype): Literal

    export function literal(value: string, languageOrDatatype: string|NamedNode): Literal

    export class IndexedFormula {
        constructor(features: any);
    }

    export class Statement {
        constructor(subject: BlankNode|NamedNode,
                    predicate: NamedNode,
                    object: Node,
                    graph?: NamedNode);
    }

}