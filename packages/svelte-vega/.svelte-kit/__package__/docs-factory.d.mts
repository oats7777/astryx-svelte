/**
 * @file docs-factory.mjs
 * @input Svelte Vega component names and docs group metadata
 * @output Component docs metadata objects with Svelte examples
 * @position Internal helper for package-local .doc.mjs metadata modules
 */
export function createGroupDocs(): {
    name: string;
    displayName: string;
    group: string;
    category: string;
    description: string;
    usage: {
        description: string;
    };
    keywords: string[];
    components: {
        name: string;
        displayName: string;
        description: string;
        props: ({
            name: string;
            type: string;
            description: string;
            required: boolean;
        } | {
            name: string;
            type: string;
            description: string;
            required?: undefined;
        })[];
        usage: {
            description: string;
            bestPractices: {
                guidance: boolean;
                description: string;
            }[];
        };
        examples: {
            label: string;
            code: string;
        }[];
    }[];
};
//# sourceMappingURL=docs-factory.d.mts.map