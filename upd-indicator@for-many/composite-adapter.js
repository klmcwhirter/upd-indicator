import { debugLog } from './log.js';

export class CompositeRuleAdapter {
    constructor({ adapters, predicates }) {
        this.adapters = adapters;
        this.predicates = predicates;
    }

    run(rules, cancellable = null) {
        let rc = [];
        let toDisable = [];

        this.predicates.forEach((p, i) => {
            if (p(rules)) {
                debugLog(`CompositeRuleAdapter.run: ${p.name} can handle rule(s)`);

                const adapter = this.adapters[i];
                const prc = adapter(rules, cancellable);
                if (prc.length > 0) {
                    rc = rc.concat(prc);
                }
            } else {
                debugLog(`CompositeRuleAdapter.run: ${p.name} cannot handle rule(s) - disabling`);
                toDisable.push(p);
            }
        });

        // Handle disabling outside of the iteration loop ...
        toDisable.forEach((p) => {
            const i = this.predicates.indexOf(p);
            if (i >= 0) {
                delete this.adapters[i];
                delete this.predicates[i];
            }
        });

        return rc;
    }
}
