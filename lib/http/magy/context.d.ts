import { Request } from '../context';
export interface MQLContext {
    query: {
        mql: string;
        mqlParseMode: 'json' | 'dsl';
    };
}
export declare const getParsedQuery: (req: Request<MQLContext>) => import("../../kernel/magy/query").ParsedQuery;
