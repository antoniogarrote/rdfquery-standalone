import * as $rdf from "rdflib"
import {RDFQuery, T} from "./rdfquery";
import {RDFGraph, RDFGraphIterator, RDFQueryInterface, Triple} from "./rdf_interfaces";

/**
 * Creates a ne RDFLibGraph wrapping a provided $rdf.graph or creating
 * a new one if no graph is provided
 * @param store rdflib graph object
 * @constructor
 */
export class RDFLibGraph implements RDFGraph {

    constructor(public store?) {
        if (store != null) {
            this.store = store;
        } else {
            this.store = $rdf.graph();
        }
    }

    find(s, p, o) {
        return new RDFLibGraphIterator(this, this.store, s, p, o);
    }

    query(): RDFQueryInterface {
        return RDFQuery(this);
    };

    loadGraph(str, graphURI, mimeType, cb) {
        const newStore = $rdf.graph();
        if (mimeType === "application/ld+json") {
            $rdf.parse(str, newStore, graphURI, mimeType, (err, kb) => {
                if (err != null) {
                    cb(err)
                } else {
                    postProcessGraph(this.store, graphURI, newStore);
                    cb(null, this);
                }
            });
        } else {
            try {
                $rdf.parse(str, newStore, graphURI, mimeType);
                postProcessGraph(this.store, graphURI, newStore);
                cb(null, this);
            }
            catch (ex) {
                cb(ex, null);
            }
        }
    }

    clear() {
        this.store = $rdf.graph();
    }
}




export class RDFLibGraphIterator implements RDFGraphIterator {
    ss: any;
    index: number;

    constructor(public source: RDFGraph, store, s, p, o) {
        this.index = 0;
        this.ss = store.statementsMatching(s, p, o);
    }

    close() {
        // Do nothing
    }

    next(): Triple|undefined {
        if (this.index >= this.ss.length) {
            return null;
        }
        else {
            return this.ss[this.index++];
        }
    }
}


function ensureBlankId(component) {
    if (component.termType === "BlankNode") {
        if (typeof(component.value) !== "string") {
            component.value = "_:" + component.id;
        }
        return component;
    }

    return component
}

function createRDFListNode(store, items, index) {
    if (index >= items.length) {
        return T("rdf:nil");
    }
    else {
        var bnode = $rdf.blankNode();
        store.add(bnode, T("rdf:first"), items[index]);
        store.add(bnode, T("rdf:rest"), createRDFListNode(store, items, index + 1));
        return bnode;
    }
};


function postProcessGraph(store, graphURI, newStore) {

    var ss = newStore.statementsMatching(undefined, undefined, undefined);
    for (var i = 0; i < ss.length; i++) {
        var object = ss[i].object;
        ensureBlankId(ss[i].subject);
        ensureBlankId(ss[i].predicate);
        ensureBlankId(ss[i].object);
        if (T("xsd:boolean").equals(object.datatype)) {
            if ("0" === object.value || "false" === object.value) {
                store.add(ss[i].subject, ss[i].predicate, T("false"), graphURI);
            }
            else if ("1" === object.value || "true" === object.value) {
                store.add(ss[i].subject, ss[i].predicate, T("true"), graphURI);
            } else {
                store.add(ss[i].subject, ss[i].predicate, object, graphURI);
            }
        }
        else if (object.termType === 'collection') {
            var items = object.elements;
            store.add(ss[i].subject, ss[i].predicate, createRDFListNode(store, items, 0));
        }
        else {
            store.add(ss[i].subject, ss[i].predicate, ss[i].object, graphURI);
        }
    }

    for (var prefix in newStore.namespaces) {
        var ns = newStore.namespaces[prefix];
        store.namespaces[prefix] = ns;
    }
}