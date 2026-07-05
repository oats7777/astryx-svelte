export const docs: {
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
//# sourceMappingURL=vega.doc.d.mts.map