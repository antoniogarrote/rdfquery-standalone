import * as $rdf from "rdflib";
import {BlankNode, Literal, NamedNode, RDFTerm, TermFactory} from "./rdf_interfaces";

// Monkey Patching rdflib, Literals, BlankNodes and NamedNodes
const exLiteral = $rdf.literal("a", "de");
Object.defineProperty(Object.getPrototypeOf(exLiteral), "lex", { get: function () { return this.value } });
Object.getPrototypeOf(exLiteral).isBlankNode = function () { return false };
Object.getPrototypeOf(exLiteral).isLiteral = function () { return true };
Object.getPrototypeOf(exLiteral).isURI = function () { return false };

const exBlankNode = $rdf.blankNode();
Object.getPrototypeOf(exBlankNode).isBlankNode = function () { return true };
Object.getPrototypeOf(exBlankNode).isLiteral = function () { return false };
Object.getPrototypeOf(exBlankNode).isURI = function () { return false };

const exNamedNode = $rdf.namedNode("urn:x-dummy");
Object.getPrototypeOf(exNamedNode).isBlankNode = function () { return false };
Object.getPrototypeOf(exNamedNode).isLiteral = function () { return false };
Object.getPrototypeOf(exNamedNode).isURI = function () { return true };


const REGEX_URI = /^([a-z][a-z0-9+.-]*):(?:\/\/((?:(?=((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*))(\3)@)?(?=(\[[0-9A-F:.]{2,}\]|(?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*))\5(?::(?=(\d*))\6)?)(\/(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\8)?|(\/?(?!\/)(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\10)?)(?:\?(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\11)?(?:#(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\12)?$/i;

class RDFLibTermFactory implements TermFactory{

    namespaces: { [p: string]: string } = {};

    registerNamespace(prefix: string, namespace: string): any {
        if(this.namespaces.prefix) {
            throw new Error("Prefix " + prefix + " already registered");
        }
        this.namespaces[prefix] = namespace;
    }

    term(str: string): RDFTerm {
        // TODO: this implementation currently only supports booleans and qnames - better overload to rdflib.js
        if ("true" === str || "false" === str) {
            return this.literal(str, (<NamedNode> this.term("xsd:boolean")));
        }

        if (str.match(/^\d+$/)) {
            return this.literal(str, (<NamedNode> this.term("xsd:integer")));
        }

        if (str.match(/^\d+\.\d+$/)) {
            return this.literal(str, (<NamedNode> this.term("xsd:float")));
        }

        const col = str.indexOf(":");
        if (col > 0) {
            const ns = this.namespaces[str.substring(0, col)];
            if (ns != null) {
                return this.namedNode(ns + str.substring(col + 1));
            } else {
                if (str.match(REGEX_URI)) {
                    return this.namedNode(str)
                }
            }
        }
        return this.literal(str);
    }

    blankNode(id: string): BlankNode {
        return (<BlankNode> $rdf.blankNode(id));
    }

    literal(value: string, languageOrDatatype?: string | NamedNode): Literal {
        return $rdf.literal(value, languageOrDatatype);
    }

    namedNode(uri: string): NamedNode {
        return $rdf.namedNode(uri);
    }

    uri(uri: string): NamedNode {
        return this.namedNode(uri);
    }
}

export default new RDFLibTermFactory();