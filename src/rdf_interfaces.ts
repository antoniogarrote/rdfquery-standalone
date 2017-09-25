export type TermType = 'BlankNode' | 'NamedNode' | 'Literal' | 'Varible';
export interface Node {
    termType: TermType;
    compareTerm(other: Node): number;
    equals(other: Node): boolean;
    hasString(): string;
    sameTerm(other: Node): boolean;
    toCanonical(): string;
    toNT(): string;
    toString(): string;
    value: string;
    isBlankNode(): boolean;
    isLiteral(): boolean;
    isURI(): boolean;
}

export interface BlankNode extends Node {}
export interface NamedNode extends Node {
    uri: string;
}
export interface Literal extends Node {
    datatype: NamedNode;
    language: string;
}
export interface Variable extends Node {}

export type RDFTerm = NamedNode|Literal|BlankNode;

export interface Triple {
    subject: NamedNode|BlankNode;
    predicate: NamedNode;
    object: RDFTerm;
}

export type VarName = string;


// In some environments such as Nashorn this may already have a value
// In TopBraid this is redirecting to native Jena calls
export interface TermFactory {

    // Globally registered prefixes for TTL short cuts
    namespaces: {[prefix: string]: string};

    /**
     * Registers a new namespace prefix for global TTL short cuts (qnames).
     * @param prefix  the prefix to add
     * @param namespace  the namespace to add for the prefix
     */
    registerNamespace(prefix: string, namespace: string): any;

    /**
     * Produces an RDF* term from a TTL string representation.
     * Also uses the registered prefixes.
     * @param str  a string, e.g. "owl:Thing" or "true" or '"Hello"@en'.
     * @return an RDF term
     */
    term(str: string): RDFTerm;

    /**
     * Produces a new blank node.
     * @param id  an optional ID for the node
     */
    blankNode(id: string): BlankNode;

    /**
     * Produces a new literal.  For example .literal("42", T("xsd:integer")).
     * @param value
     * @param languageOrDatatype
     */
    literal(value: string, languageOrDatatype: string|NamedNode): Literal;

    // This function is basically left for Task Force compatibility, but the preferred function is uri()
    namedNode(uri: string): NamedNode;

    /**
     * Produces a new URI node.
     * @param uri  the URI of the node
     */
    uri(uri: string): NamedNode;
}

export interface NodeSetInterface {
    add(node: Node)
    addAll(nodes: Node[])
    contains(node: Node)
    forEach(callback: (node: Node) => void)
    size(): number
    toArray(): Node[]
    toString(): String
}


export type Solution = {[varName: string]: RDFTerm}

export interface RDFQueryInterface {

    source: RDFGraph;

    /**
     * Creates a new query that adds a binding for a given variable into
     * each solution produced by the input query.
     * @param varName  the name of the variable to bind, starting with "?"
     * @param bindFunction  a function that takes a solution object
     *                      and returns a node or null based on it.
     */
    bind(varName: VarName, bindFunction: (result: Solution) => RDFTerm): RDFQueryInterface;

    /**
     * Creates a new query that filters the solutions produced by this.
     * @param filterFunction  a function that takes a solution object
     *                        and returns true iff that solution is valid
     */
    filter(filterFunction: (result: Solution) => boolean): RDFQueryInterface

    /**
     * Creates a new query that only allows the first n solutions through.
     * @param limit  the maximum number of results to allow
     */
    limit(limit: number): RDFQueryInterface

    /**
     * Creates a new query doing a triple match.
     * In each subject, predicate, object position, the values can either be
     * an RDF term object or null (wildcard) or a string.
     * If it is a string it may either be a variable (starting with "?")
     * or the TTL representation of an RDF term using the T() function.
     * @param s  the match subject
     * @param p  the match predicate
     * @param o  the match object
     */
    match(s: VarName|BlankNode|NamedNode, p: VarName|NamedNode, o: VarName|RDFTerm): RDFQueryInterface

    /**
     * Creates a new query that sorts all input solutions by the bindings
     * for a given variable.
     * @param varName  the name of the variable to sort by, starting with "?"
     */
    orderBy(varName: VarName): RDFQueryInterface

    /**
     * Creates a new query doing a match where the predicate may be a RDF Path object.
     * Note: This is currently not using lazy evaluation and will always walk all matches.
     * Path syntax:
     * - PredicatePaths: NamedNode
     * - SequencePaths: [path1, path2]
     * - AlternativePaths: { or : [ path1, path2 ] }
     * - InversePaths: { inverse : path }   LIMITATION: Only supports NamedNodes for path here
     * - ZeroOrMorePaths: { zeroOrMore : path }
     * - OneOrMorePaths: { oneOrMore : path }
     * - ZeroOrOnePaths: { zeroOrOne : path }
     * @param s  the match subject or a variable name (string) - must have a value
     *           at execution time!
     * @param path  the match path object (e.g. a NamedNode for a simple predicate hop)
     * @param o  the match object or a variable name (string)
     */
    path(s: VarName|NamedNode|BlankNode, path, o: VarName|RDFTerm): RDFQueryInterface

// TODO: add other SPARQL-like query types
//       - .distinct()
//       - .union(otherQuery)

    // ----------------------------------------------------------------------------
    // Terminal functions - convenience functions to get values.
    // All these functions close the solution iterators.
    // ----------------------------------------------------------------------------

    /**
     * Adds all nodes produced by a given solution variable into a set.
     * The set must have an add(node) function.
     * @param varName  the name of the variable, starting with "?"
     * @param set  the set to add to
     */
    addAllNodes(varName: VarName, set: NodeSetInterface): void

    /**
     * Produces an array of triple objects where each triple object has properties
     * subject, predicate and object derived from the provided template values.
     * Each of these templates can be either a variable name (starting with '?'),
     * an RDF term string (such as "rdfs:label") or a JavaScript node object.
     * @param subject  the subject node
     * @param predicate  the predicate node
     * @param object  the object node
     */
    construct(subject: VarName|NamedNode|BlankNode,
              predicate: VarName|NamedNode,
              object: VarName|RDFTerm): Triple[]

    /**
     * Executes a given function for each solution.
     * @param callback  a function that takes a solution as argument
     */
    forEach(callback: (s: Solution) => void)

    /**
     * Executes a given function for each node in a solution set.
     * @param varName  the name of a variable, starting with "?"
     * @param callback  a function that takes a node as argument
     */
    forEachNode(varName: VarName, callback: (RDFTerm) => void)

    /**
     * Turns all result solutions into an array.
     * @return an array consisting of solution objects
     */
    getArray(): Solution[];


    /**
     * Gets the number of (remaining) solutions.
     * @return the count
     */
    getCount(): number;

    /**
     * Gets the next solution and, if that exists, returns the binding for a
     * given variable from that solution.
     * @param varName  the name of the binding to get, starting with "?"
     * @return the value of the variable or null or undefined if it doesn't exist
     */
    getNode(varName: VarName): RDFTerm|undefined;

    /**
     * Turns all results into an array of bindings for a given variable.
     * @return an array consisting of RDF node objects
     */
    getNodeArray(varName: VarName): RDFTerm[];

    /**
     * Turns all result bindings for a given variable into a set.
     * The set has functions .contains and .toArray.
     * @param varName  the name of the variable, starting with "?"
     * @return a set consisting of RDF node objects
     */
    getNodeSet(varName: VarName): NodeSetInterface;

    /**
     * Queries the underlying graph for the object of a subject/predicate combination,
     * where either subject or predicate can be a variable which is substituted with
     * a value from the next input solution.
     * Note that even if there are multiple solutions it will just return the "first"
     * one and since the order of triples in RDF is undefined this may lead to random results.
     * Unbound values produce errors.
     * @param subject  an RDF term or a variable (starting with "?") or a TTL representation
     * @param predicate  an RDF term or a variable (starting with "?") or a TTL representation
     * @return the object of the "first" triple matching the subject/predicate combination
     */
    getObject(subject: VarName|BlankNode|NamedNode, predicate:string|VarName|NamedNode): RDFTerm|undefined;

    /**
     * Tests if there is any solution and closes the query.
     * @return true if there is another solution
     */
    hasSolution(): boolean;

    nextSolution(): Solution|undefined;

    close(): void;
}

export interface RDFGraphIterator {
    source: RDFGraph;
    close(): void;
    next(): Triple|undefined
}

export interface RDFGraph {
    query(): RDFQueryInterface;
    find(s: Node|null, p: Node|null, o: Node|null): RDFGraphIterator;
    loadGraph(data: string, graphURI: string, mediaType: string, cb: (e?: Error, graph?: RDFGraph) => void): void
    clear(): void

}
